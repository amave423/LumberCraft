import { Link } from "wouter";
import { Network, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Network className="h-8 w-8 text-amber" />
              <span className="font-display font-bold text-xl">ЛесПром</span>
            </div>
            <p className="text-gray-400 mb-4">
              Производство и продажа качественных пиломатериалов с 2015 года. 
              Полный цикл обработки древесины.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber transition-colors">
                VK
              </a>
              <a href="#" className="text-gray-400 hover:text-amber transition-colors">
                Telegram
              </a>
              <a href="#" className="text-gray-400 hover:text-amber transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Продукция</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-amber transition-colors">Ленточное пиление</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Дисковое пиление</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Строганные доски</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Сушеная доска</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Брус</a></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Услуги</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-amber transition-colors">Распиловка по размерам</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Сушка древесины</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Строгание</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Доставка</a></li>
              <li><a href="#" className="hover:text-amber transition-colors">Консультация</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Контакты</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-amber" />
                <span>+7 (495) 123-45-67</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-amber" />
                <span>info@lesprom.ru</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 text-amber mt-1" />
                <span>г. Москва, ул. Лесопильная, 15</span>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-800 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ЛесПром. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-amber transition-colors text-sm">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-gray-400 hover:text-amber transition-colors text-sm">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
