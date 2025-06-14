import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Calculator from "@/components/calculator";
import ProductGrid from "@/components/product-grid";
import Reviews from "@/components/reviews";
import ParallaxSection from "@/components/parallax-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator as CalcIcon, Phone, Slice, Settings, Ruler, Flame } from "lucide-react";

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-indicator" 
        style={{ width: `${scrollProgress}%` }}
      />

      <Header />

      {/* Hero Section */}
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
        className="h-screen flex items-center justify-center text-white"
        overlay="bg-forest-dark/70"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              Качественные<br />
              <span className="text-amber">Пиломатериалы</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Производство и продажа пиломатериалов высшего качества. 
              Ленточное и дисковое пиление, строганные и сушеные доски.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-amber hover:bg-amber/90 text-forest-dark font-semibold"
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator');
                  if (calculatorSection) {
                    calculatorSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <CalcIcon className="mr-2 h-5 w-5" />
                Рассчитать стоимость
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-forest-dark"
                onClick={() => window.location.href = '/api/login'}
              >
                <Phone className="mr-2 h-5 w-5" />
                Войти в систему
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-2xl text-white">↓</div>
        </div>
      </ParallaxSection>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-dark mb-6">
              Калькулятор пиломатериалов
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Рассчитайте точную стоимость и количество материалов
            </p>
          </div>
          <Calculator />
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-warm-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-dark mb-6">
              Наша продукция
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Полный спектр пиломатериалов для строительства и отделки
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Ленточное пиление",
                description: "Точная распиловка с минимальными потерями материала",
                icon: Slice,
                price: "от 8,500 ₽/м³",
                image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
              },
              {
                title: "Дисковое пиление", 
                description: "Высокая скорость обработки для крупных объемов",
                icon: Settings,
                price: "от 7,800 ₽/м³",
                image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
              },
              {
                title: "Строганные доски",
                description: "Идеально гладкая поверхность для отделочных работ", 
                icon: Ruler,
                price: "от 850 ₽/м²",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
              },
              {
                title: "Доска после сушилки",
                description: "Профессиональная сушка до оптимальной влажности",
                icon: Flame,
                price: "от 9,200 ₽/м³", 
                image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
              }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-hover transition-all duration-300 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold text-forest-dark mb-3 flex items-center">
                      <category.icon className="mr-2 h-5 w-5 text-amber" />
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{category.price}</span>
                      <Button variant="ghost" size="sm" className="text-forest-dark hover:text-amber">
                        Подробнее →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <ProductGrid />

      {/* Calculator Section */}
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
        className="py-20 text-white"
        overlay="bg-forest-dark/90"
      >
        <Calculator />
      </ParallaxSection>

      {/* Reviews Section */}
      <Reviews />

      {/* Contact Section */}
      <section className="py-20 bg-forest-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Свяжитесь с нами
            </h2>
            <p className="text-xl max-w-3xl mx-auto">
              Готовы ответить на ваши вопросы и помочь с выбором пиломатериалов
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                {
                  icon: "📍",
                  title: "Адрес",
                  content: "г. Москва, Промышленная зона \"Северная\"\nул. Лесопильная, д. 15"
                },
                {
                  icon: "📞", 
                  title: "Телефон",
                  content: "+7 (495) 123-45-67\n+7 (800) 555-12-34"
                },
                {
                  icon: "✉️",
                  title: "Email", 
                  content: "info@lesprom.ru\nzakaz@lesprom.ru"
                },
                {
                  icon: "🕒",
                  title: "Режим работы",
                  content: "Пн-Пт: 8:00 - 18:00\nСб: 9:00 - 16:00\nВс: выходной"
                }
              ].map((contact) => (
                <div key={contact.title} className="flex items-start space-x-4">
                  <div className="bg-amber rounded-lg p-3 text-2xl">
                    {contact.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-2">{contact.title}</h3>
                    <p className="text-white/80 whitespace-pre-line">{contact.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-semibold mb-6 text-white">Задать вопрос</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      placeholder="Ваше имя *"
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                    <input 
                      type="tel" 
                      placeholder="+7 (___) ___-__-__"
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>
                  
                  <input 
                    type="email" 
                    placeholder="example@mail.ru"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                  
                  <textarea 
                    rows={4}
                    placeholder="Опишите ваш вопрос или требования к пиломатериалам..."
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                  
                  <Button className="w-full bg-amber hover:bg-amber/90 text-forest-dark font-semibold">
                    Отправить сообщение
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
