import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Package, Phone, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const orderFormSchema = insertOrderSchema.extend({
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  comment: z.string().optional(),
  quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
});

interface OrderFormProps {
  selectedProduct?: any;
  calculationResult?: any;
  customDimensions?: {
    thickness: number;
    width: number;
    length: number;
    sawType: string;
    quantity: number;
  };
}

export default function OrderForm({ 
  selectedProduct, 
  calculationResult,
  customDimensions 
}: OrderFormProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      productId: selectedProduct?.id || 0,
      quantity: customDimensions?.quantity || 1,
      phone: '',
      email: user?.email || '',
      comment: '',
      totalPrice: calculationResult?.totalPrice || 0,
    }
  });

  const quantity = watch('quantity');

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ 
        title: "Заказ оформлен", 
        description: "Мы свяжемся с вами в ближайшее время" 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для оформления заказа",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Ошибка", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const calculatePrice = () => {
    if (selectedProduct) {
      const isPlaned = selectedProduct.sawType === 'planed';
      if (isPlaned) {
        const areaPerPiece = (selectedProduct.width * parseFloat(selectedProduct.length)) / 1000;
        return parseFloat(selectedProduct.pricePerSquare) * areaPerPiece * quantity;
      } else {
        const volumePerPiece = (selectedProduct.thickness * selectedProduct.width * parseFloat(selectedProduct.length)) / 1000000;
        return parseFloat(selectedProduct.pricePerCubic) * volumePerPiece * quantity;
      }
    } else if (calculationResult) {
      const pricePerPiece = calculationResult.totalPrice / calculationResult.quantity;
      return pricePerPiece * quantity;
    }
    return 0;
  };

  const onSubmit = (data: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для оформления заказа",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    const totalPrice = calculatePrice();
    
    createOrderMutation.mutate({
      ...data,
      totalPrice: totalPrice.toFixed(2),
      productId: selectedProduct?.id || null,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber" />
            Требуется авторизация
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 mb-6">
          Для оформления заказа необходимо войти в систему
        </p>
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-forest-dark hover:bg-forest-light text-white"
        >
          Войти в систему
        </Button>
      </div>
    );
  }

  return (
    <div>
      <DialogHeader className="mb-6">
        <DialogTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-forest-dark" />
          Оформление заказа
        </DialogTitle>
      </DialogHeader>

      {/* Order Summary */}
      <Card className="mb-6 bg-warm-gray">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-forest-dark mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-forest-dark mb-2">
                {selectedProduct 
                  ? `${selectedProduct.thickness}×${selectedProduct.width}×${parseFloat(selectedProduct.length) * 1000} мм`
                  : customDimensions 
                    ? `${customDimensions.thickness}×${customDimensions.width}×${customDimensions.length * 1000} мм`
                    : 'Пиломатериал'
                }
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Количество:</span>
                  <span>{quantity} шт</span>
                </div>
                <div className="flex justify-between">
                  <span>Тип:</span>
                  <span>
                    {selectedProduct?.sawType === 'band' ? 'Ленточное пиление' :
                     selectedProduct?.sawType === 'disc' ? 'Дисковое пиление' :
                     selectedProduct?.sawType === 'planed' ? 'Строганная доска' :
                     selectedProduct?.sawType === 'dried' ? 'После сушилки' :
                     customDimensions?.sawType === 'band' ? 'Ленточное пиление' :
                     customDimensions?.sawType === 'disc' ? 'Дисковое пиление' :
                     customDimensions?.sawType === 'planed' ? 'Строганная доска' :
                     customDimensions?.sawType === 'dried' ? 'После сушилки' :
                     'Не указан'}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-forest-dark">
                  <span>Итого:</span>
                  <span>{calculatePrice().toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Количество (шт) *
          </Label>
          <Input 
            id="quantity"
            type="number" 
            min="1"
            {...register('quantity')}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Номер телефона *
          </Label>
          <Input 
            id="phone"
            type="tel" 
            placeholder="+7 (___) ___-__-__"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email (необязательно)
          </Label>
          <Input 
            id="email"
            type="email" 
            placeholder="example@mail.ru"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="comment" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Комментарий к заказу
          </Label>
          <Textarea 
            id="comment"
            placeholder="Дополнительные пожелания или требования..."
            rows={3}
            {...register('comment')}
          />
        </div>

        <div className="bg-amber/10 border border-amber/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Обработка заказа:</p>
              <p>После отправки заказа наш менеджер свяжется с вами для уточнения деталей и подтверждения. Доставка рассчитывается отдельно.</p>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-forest-dark hover:bg-forest-light text-white"
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? (
            'Оформление...'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Оформить заказ на {calculatePrice().toLocaleString('ru-RU')} ₽
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
