import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Calculator from "@/components/calculator";
import ProductGrid from "@/components/product-grid";
import Reviews from "@/components/reviews";
import Chat from "@/components/chat";
import ParallaxSection from "@/components/parallax-section";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

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

      {/* Welcome Section */}
      <section className="py-20 bg-warm-gray">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-forest-dark mb-4">
              Добро пожаловать, {user?.firstName || 'пользователь'}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Управляйте заказами, используйте калькулятор и общайтесь с нашими специалистами
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-forest-dark mb-2">
                  {ordersLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (orders?.length || 0)}
                </div>
                <p className="text-gray-600">Ваши заказы</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-forest-dark mb-2">24/7</div>
                <p className="text-gray-600">Поддержка</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-forest-dark mb-2">500+</div>
                <p className="text-gray-600">Довольных клиентов</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          {orders && orders.length > 0 && (
            <Card className="mb-12">
              <CardContent className="p-6">
                <h3 className="font-display text-2xl font-semibold text-forest-dark mb-6">
                  Последние заказы
                </h3>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-warm-gray rounded-lg">
                      <div>
                        <p className="font-medium text-forest-dark">Заказ #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-forest-dark">{order.totalPrice} ₽</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'pending' ? 'В обработке' :
                           order.status === 'accepted' ? 'Принят' :
                           order.status === 'rejected' ? 'Отклонен' :
                           'Выполнен'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

      <Footer />
      
      {/* Chat Widget */}
      <Chat />
    </div>
  );
}
