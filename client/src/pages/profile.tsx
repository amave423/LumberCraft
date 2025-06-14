import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Package, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

interface Order {
  id: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productInfo: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  notes?: string;
  createdAt: string;
}

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для доступа к личному кабинету",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <Package className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидание";
      case "accepted":
        return "Принят";
      case "completed":
        return "Выполнен";
      case "rejected":
        return "Отклонен";
      default:
        return "Неизвестно";
    }
  };

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-forest-dark">
                <User className="h-6 w-6 text-amber" />
                Личный кабинет
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Аватар" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-forest-dark">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">ID: {user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-forest-dark">
                <Package className="h-5 w-5 text-amber" />
                Мои заказы
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber mx-auto"></div>
                  <p className="mt-2 text-gray-600">Загрузка заказов...</p>
                </div>
              ) : !orders || (orders as Order[]).length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Нет заказов</h3>
                  <p className="text-gray-500">У вас пока нет заказов. Воспользуйтесь калькулятором для создания заказа.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order: Order) => (
                    <Card key={order.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-forest-dark mb-1">
                              Заказ #{order.id}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Продукт:</p>
                            <p className="font-medium">{order.productInfo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Количество:</p>
                            <p className="font-medium">{order.quantity} шт</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Контакт:</p>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerEmail}</p>
                            {order.customerPhone && (
                              <p className="text-sm text-gray-600">{order.customerPhone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Общая стоимость:</p>
                            <p className="text-xl font-bold text-forest-dark">
                              {order.totalPrice.toLocaleString()} ₽
                            </p>
                          </div>
                        </div>
                        
                        {order.notes && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Примечания:</p>
                              <p className="text-gray-800">{order.notes}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}