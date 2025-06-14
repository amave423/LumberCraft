import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Send, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";

const reviewFormSchema = insertReviewSchema.extend({
  rating: z.number().min(1).max(5),
});

export default function Reviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['/api/reviews'],
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: '',
      email: '',
      rating: 0,
      content: '',
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/reviews', data);
    },
    onSuccess: () => {
      toast({ 
        title: "Отзыв отправлен", 
        description: "Ваш отзыв будет опубликован после модерации" 
      });
      reset();
      setSelectedRating(0);
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedRating === 0) {
      toast({ title: "Ошибка", description: "Пожалуйста, поставьте оценку", variant: "destructive" });
      return;
    }
    createReviewMutation.mutate({ ...data, rating: selectedRating });
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  return (
    <section className="py-20 bg-warm-gray" id="reviews">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-dark mb-6">
            Отзывы клиентов
          </h2>
          <p className="text-xl text-gray-600">
            Более 500 довольных клиентов за последний год
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            reviews?.map((review: any, index: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-hover transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="w-12 h-12 mr-4">
                        <AvatarFallback className="bg-forest-light text-white font-bold">
                          {review.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-forest-dark">{review.name}</h4>
                        <div className="flex text-amber">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{review.content}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Add Review Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-amber" />
                Оставить отзыв
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Ваше имя *</Label>
                    <Input 
                      id="name" 
                      placeholder="Введите ваше имя"
                      {...register('name')}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="example@mail.ru"
                      {...register('email')}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Label>Оценка *</Label>
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className={`text-3xl transition-colors ${
                          rating <= selectedRating ? 'text-amber' : 'text-gray-300'
                        } hover:text-amber`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content">Ваш отзыв *</Label>
                  <Textarea 
                    id="content"
                    rows={4}
                    placeholder="Поделитесь вашим опытом работы с нами..."
                    {...register('content')}
                  />
                  {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
                </div>
                
                <div className="bg-amber/10 border border-amber/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <strong>Модерация отзывов:</strong> Ваш отзыв будет опубликован после проверки администратором в течение 24 часов.
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-forest-dark hover:bg-forest-light text-white"
                  disabled={createReviewMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {createReviewMutation.isPending ? 'Отправка...' : 'Отправить отзыв'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
