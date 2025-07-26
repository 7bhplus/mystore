import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db as user_db
from src.models.product import Product
from flask import Flask
import json

def create_sample_data():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    user_db.init_app(app)
    
    with app.app_context():
        # إنشاء الجداول
        user_db.create_all()
        
        # حذف البيانات الموجودة
        Product.query.delete()
        
        # إضافة منتجات تجريبية
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
            },
            {
                'name': 'Canva Pro',
                'description': 'كانفا برو - تصميم احترافي سهل',
                'category': 'إنتاجية',
                'price_usd': 12.99,
                'price_sar': 48.74,
                'duration_months': 1,
                'image_url': 'https://via.placeholder.com/300x200?text=Canva',
                'features': json.dumps([
                    'ملايين القوالب المميزة',
                    'إزالة خلفية الصور',
                    'تخزين سحابي 1TB',
                    'تعاون الفريق'
                ])
            },
            {
                'name': 'Grammarly Premium',
                'description': 'جرامرلي بريميوم - تصحيح نحوي متقدم',
                'category': 'إنتاجية',
                'price_usd': 12.00,
                'price_sar': 45.00,
                'duration_months': 1,
                'image_url': 'https://via.placeholder.com/300x200?text=Grammarly',
                'features': json.dumps([
                    'تصحيح نحوي متقدم',
                    'اقتراحات تحسين الأسلوب',
                    'كشف الانتحال',
                    'دعم جميع المنصات'
                ])
            }
        ]
        
        for product_data in products:
            product = Product(**product_data)
            user_db.session.add(product)
        
        user_db.session.commit()
        print("تم إضافة البيانات التجريبية بنجاح!")

if __name__ == '__main__':
    create_sample_data()

