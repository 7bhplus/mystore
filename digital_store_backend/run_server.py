import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.product import product_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'src', 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(product_bp, url_prefix='/api')

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(os.path.dirname(__file__), "src", "database", "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from src.models.product import Product, Order, OrderItem, Cart

db.init_app(app)
with app.app_context():
    db.create_all()
    
    # Add sample data if no products exist
    try:
        if Product.query.count() == 0:
            import json
            products = [
                {
                    'name': 'Netflix Premium',
                    'description': 'اشتراك نتفليكس بريميوم - مشاهدة غير محدودة بجودة 4K',
                    'category': 'ترفيه',
                    'price_usd': 15.99,
                    'price_sar': 59.99,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=Netflix',
                    'features': json.dumps([
                        'مشاهدة على 4 أجهزة في نفس الوقت',
                        'جودة Ultra HD (4K)',
                        'تحميل المحتوى للمشاهدة بدون إنترنت',
                        'مكتبة ضخمة من الأفلام والمسلسلات'
                    ])
                },
                {
                    'name': 'Spotify Premium',
                    'description': 'اشتراك سبوتيفاي بريميوم - موسيقى بدون إعلانات',
                    'category': 'موسيقى',
                    'price_usd': 9.99,
                    'price_sar': 37.49,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=Spotify',
                    'features': json.dumps([
                        'موسيقى بدون إعلانات',
                        'تحميل الموسيقى للاستماع بدون إنترنت',
                        'جودة صوت عالية',
                        'تخطي الأغاني بلا حدود'
                    ])
                },
                {
                    'name': 'Adobe Creative Cloud',
                    'description': 'مجموعة أدوبي الإبداعية الكاملة',
                    'category': 'إنتاجية',
                    'price_usd': 52.99,
                    'price_sar': 198.74,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=Adobe',
                    'features': json.dumps([
                        'Photoshop, Illustrator, Premiere Pro',
                        'After Effects, InDesign, Lightroom',
                        'تخزين سحابي 100GB',
                        'خطوط Adobe وأصول إبداعية'
                    ])
                },
                {
                    'name': 'Microsoft 365',
                    'description': 'مايكروسوفت أوفيس 365 للأفراد',
                    'category': 'إنتاجية',
                    'price_usd': 6.99,
                    'price_sar': 26.24,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=Office365',
                    'features': json.dumps([
                        'Word, Excel, PowerPoint, Outlook',
                        'OneDrive 1TB تخزين سحابي',
                        'Teams للتعاون',
                        'تحديثات مستمرة'
                    ])
                },
                {
                    'name': 'YouTube Premium',
                    'description': 'يوتيوب بريميوم - مشاهدة بدون إعلانات',
                    'category': 'ترفيه',
                    'price_usd': 11.99,
                    'price_sar': 44.99,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=YouTube',
                    'features': json.dumps([
                        'مشاهدة بدون إعلانات',
                        'تشغيل في الخلفية',
                        'تحميل الفيديوهات',
                        'YouTube Music مجاناً'
                    ])
                },
                {
                    'name': 'Disney Plus',
                    'description': 'ديزني بلس - عالم ديزني وبيكسار ومارفل',
                    'category': 'ترفيه',
                    'price_usd': 7.99,
                    'price_sar': 29.99,
                    'duration_months': 1,
                    'image_url': 'https://via.placeholder.com/300x200?text=Disney+',
                    'features': json.dumps([
                        'محتوى ديزني وبيكسار',
                        'أفلام ومسلسلات مارفل',
                        'Star Wars الكاملة',
                        'National Geographic'
                    ])
                }
            ]
            
            for product_data in products:
                product = Product(**product_data)
                db.session.add(product)
            
            db.session.commit()
            print("تم إضافة البيانات التجريبية بنجاح!")
    except Exception as e:
        print(f"خطأ في إضافة البيانات التجريبية: {e}")
        # Continue without sample data

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return 'Static folder not configured', 404

    if path != '' and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return 'index.html not found', 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

