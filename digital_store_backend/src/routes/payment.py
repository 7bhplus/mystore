from flask import Blueprint, request, jsonify
import requests
import json

payment_bp = Blueprint('payment', __name__)

# مفاتيح تاب للمدفوعات (Test Environment)
TAP_SECRET_KEY = 'sk_test_NztKU1MPkwfV3ldFusX84Ahy'
TAP_PUBLIC_KEY = 'pk_test_1n0xc9JZ3OPahypstDVXv5oE'
TAP_API_URL = 'https://api.tap.company/v2'

@payment_bp.route('/create-payment', methods=['POST'])
def create_payment():
    """إنشاء عملية دفع جديدة مع تاب للمدفوعات"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['amount', 'currency', 'customer_email', 'customer_name', 'items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # إعداد بيانات الدفع
        payment_data = {
            "amount": data['amount'],
            "currency": data['currency'],
            "threeDSecure": True,
            "save_card": False,
            "description": "Digital Store Purchase",
            "statement_descriptor": "Digital Store",
            "metadata": {
                "udf1": "Digital Subscriptions Store",
                "udf2": "Online Purchase"
            },
            "reference": {
                "transaction": f"txn_{data.get('order_id', 'unknown')}",
                "order": f"ord_{data.get('order_id', 'unknown')}"
            },
            "receipt": {
                "email": True,
                "sms": False
            },
            "customer": {
                "first_name": data['customer_name'].split(' ')[0] if ' ' in data['customer_name'] else data['customer_name'],
                "last_name": data['customer_name'].split(' ')[-1] if ' ' in data['customer_name'] else "",
                "email": data['customer_email']
            },
            "merchant": {
                "id": ""
            },
            "source": {
                "id": "src_all"
            },
            "post": {
                "url": "https://mystore-9c8i.onrender.com/api/payment/webhook"
            },
            "redirect": {
                "url": "https://mystore-9c8i.onrender.com/payment-success"
            }
        }
        
        # إرسال الطلب إلى تاب للمدفوعات
        headers = {
            'Authorization': f'Bearer {TAP_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'{TAP_API_URL}/charges',
            headers=headers,
            data=json.dumps(payment_data)
        )
        
        if response.status_code == 200:
            payment_response = response.json()
            return jsonify({
                'success': True,
                'payment_id': payment_response.get('id'),
                'payment_url': payment_response.get('transaction', {}).get('url'),
                'status': payment_response.get('status')
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create payment',
                'details': response.text
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """استقبال إشعارات الدفع من تاب للمدفوعات"""
    try:
        data = request.get_json()
        payment_id = data.get('id')
        status = data.get('status')
        
        if status == 'CAPTURED':
            print(f"Payment {payment_id} completed successfully")
        elif status == 'FAILED':
            print(f"Payment {payment_id} failed")
            
        return jsonify({'received': True}), 200
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/config', methods=['GET'])
def get_payment_config():
    """الحصول على إعدادات الدفع للواجهة الأمامية"""
    return jsonify({
        'public_key': TAP_PUBLIC_KEY,
        'supported_currencies': ['SAR', 'USD'],
        'supported_payment_methods': [
            'visa',
            'mastercard',
            'mada',
            'apple_pay',
            'stc_pay'
        ]
    })
