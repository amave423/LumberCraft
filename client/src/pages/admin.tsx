import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Download, Check, X, MessageSquare, Package, ClipboardList, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  thickness: z.coerce.number().min(1),
  width: z.coerce.number().min(1),
  length: z.coerce.number().min(0.1).max(6),
  pricePerCubic: z.coerce.number().min(0).optional(),
  pricePerSquare: z.coerce.number().min(0).optional(),
});

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: pendingReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews/pending'],
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sawType: 'band' as const,
      thickness: 0,
      width: 0,
      length: 0,
      pricePerCubic: 0,
      pricePerSquare: 0,
      inStock: true,
    }
  });

  const sawType = watch('sawType');

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Товар создан" });
      reset();
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest('PUT', `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Товар обновлен" });
      setEditingProduct(null);
      reset();
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Товар удален" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest('PUT', `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Статус заказа обновлен" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/reviews/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "Отзыв одобрен" });
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const exportOrders = async () => {
    try {
      const response = await fetch('/api/orders/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Отчет скачан" });
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось скачать отчет", variant: "destructive" });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-gray">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-forest-dark mb-2">Доступ запрещен</h1>
            <p className="text-gray-600">У вас нет прав администратора</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-forest-dark mb-4">
            Панель администратора
          </h1>
          <p className="text-gray-600">Управление товарами, заказами и отзывами</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Отзывы
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Чат
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Название</Label>
                      <Input id="name" {...register('name')} />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="sawType">Тип пиления</Label>
                      <Select 
                        value={sawType} 
                        onValueChange={(value) => setValue('sawType', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="band">Ленточное пиление</SelectItem>
                          <SelectItem value="disc">Дисковое пиление</SelectItem>
                          <SelectItem value="planed">Строганная доска</SelectItem>
                          <SelectItem value="dried">После сушилки</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="thickness">Толщина (мм)</Label>
                        <Input id="thickness" type="number" {...register('thickness')} />
                        {errors.thickness && <p className="text-xs text-red-500">{errors.thickness.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="width">Ширина (мм)</Label>
                        <Input id="width" type="number" {...register('width')} />
                        {errors.width && <p className="text-xs text-red-500">{errors.width.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="length">Длина (м)</Label>
                        <Input id="length" type="number" step="0.1" max="6" {...register('length')} />
                        {errors.length && <p className="text-xs text-red-500">{errors.length.message}</p>}
                      </div>
                    </div>

                    {sawType === 'planed' ? (
                      <div>
                        <Label htmlFor="pricePerSquare">Цена за м² (₽)</Label>
                        <Input id="pricePerSquare" type="number" step="0.01" {...register('pricePerSquare')} />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="pricePerCubic">Цена за м³ (₽)</Label>
                        <Input id="pricePerCubic" type="number" step="0.01" {...register('pricePerCubic')} />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inStock"
                        {...register('inStock')}
                        className="rounded"
                      />
                      <Label htmlFor="inStock">В наличии</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      >
                        {editingProduct ? 'Обновить' : 'Создать'}
                      </Button>
                      {editingProduct && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            reset();
                          }}
                        >
                          Отмена
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Список товаров</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <p>Загрузка...</p>
                  ) : (
                    <div className="space-y-4">
                      {products?.map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-warm-gray rounded-lg">
                          <div>
                            <h4 className="font-semibold text-forest-dark">{product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {product.thickness}×{product.width}×{product.length}м
                            </p>
                            <p className="text-sm font-medium">
                              {product.sawType === 'planed' 
                                ? `${product.pricePerSquare} ₽/м²`
                                : `${product.pricePerCubic} ₽/м³`
                              }
                            </p>
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? "В наличии" : "Нет в наличии"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProduct(product);
                                Object.keys(product).forEach(key => {
                                  setValue(key as any, product[key]);
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Заказы</CardTitle>
                <Button onClick={exportOrders} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт в Excel
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p>Загрузка...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Товар</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>{order.productId}</TableCell>
                          <TableCell>{order.totalPrice} ₽</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'accepted' ? 'default' :
                              order.status === 'rejected' ? 'destructive' :
                              order.status === 'completed' ? 'secondary' :
                              'outline'
                            }>
                              {order.status === 'pending' ? 'В обработке' :
                               order.status === 'accepted' ? 'Принят' :
                               order.status === 'rejected' ? 'Отклонен' :
                               'Выполнен'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateOrderStatusMutation.mutate({ 
                                      id: order.id, 
                                      status: 'accepted' 
                                    })}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateOrderStatusMutation.mutate({ 
                                      id: order.id, 
                                      status: 'rejected' 
                                    })}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatusMutation.mutate({ 
                                    id: order.id, 
                                    status: 'completed' 
                                  })}
                                >
                                  Завершить
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Отзывы на модерации</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <p>Загрузка...</p>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews?.map((review: any) => (
                      <div key={review.id} className="p-4 bg-warm-gray rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-forest-dark">{review.name}</h4>
                              <div className="flex text-amber">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">{review.content}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <Button
                            onClick={() => approveReviewMutation.mutate(review.id)}
                            disabled={approveReviewMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Одобрить
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingReviews?.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Нет отзывов на модерации
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Управление чатами</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Функция управления чатами будет доступна в следующем обновлении
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
