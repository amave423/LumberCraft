import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Ruler, ShoppingCart, Droplets, Flame, Settings, Slice } from "lucide-react";
import OrderForm from "./order-form";

const sawTypeIcons = {
  band: Slice,
  disc: Settings,
  planed: Ruler,
  dried: Flame,
};

const sawTypeNames = {
  band: "Ленточное пиление",
  disc: "Дисковое пиление", 
  planed: "Строганная доска",
  dried: "После сушилки",
};

export default function ProductGrid() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка товаров...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-dark mb-6">
            Популярные размеры
          </h2>
          <p className="text-xl text-gray-600">
            Готовые к отгрузке пиломатериалы стандартных размеров
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(products) && products.map((product: any, index: number) => {
            const IconComponent = sawTypeIcons[product.sawType as keyof typeof sawTypeIcons];
            const volumePerPiece = (product.thickness * product.width * parseFloat(product.length)) / 1000000;
            const areaPerPiece = (product.width * parseFloat(product.length)) / 1000;
            const isPlaned = product.sawType === 'planed';
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-hover transition-all duration-300 bg-gradient-to-br from-warm-gray to-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-forest-dark">
                          {product.thickness}×{product.width}×{parseFloat(product.length) * 1000} мм
                        </h3>
                        <p className="text-sm text-gray-500">{sawTypeNames[product.sawType as keyof typeof sawTypeNames]}</p>
                      </div>
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "В наличии" : "Под заказ"}
                      </Badge>
                    </div>
                    
                    <div className="wood-texture rounded-lg p-4 mb-4">
                      <div className="text-white text-center">
                        {IconComponent && <IconComponent className="h-8 w-8 mx-auto mb-2" />}
                        <p className="text-sm">{sawTypeNames[product.sawType as keyof typeof sawTypeNames]}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Длина:</span>
                        <span className="font-medium">{parseFloat(product.length).toFixed(1)} м</span>
                      </div>
                      {isPlaned ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Площадь (1 шт):</span>
                          <span className="font-medium">{areaPerPiece.toFixed(3)} м²</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Объем (1 шт):</span>
                          <span className="font-medium">{volumePerPiece.toFixed(3)} м³</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Влажность:</span>
                        <span className="font-medium">
                          {product.sawType === 'dried' ? '8-12%' : 
                           product.sawType === 'planed' ? '12-15%' : 'естественная'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        {isPlaned ? (
                          <>
                            <span className="text-lg font-bold text-forest-dark">
                              {(parseFloat(product.pricePerSquare) * areaPerPiece).toLocaleString('ru-RU')} ₽ за шт
                            </span>
                            <span className="text-sm text-gray-500">
                              {parseFloat(product.pricePerSquare).toLocaleString('ru-RU')} ₽/м²
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-forest-dark">
                              {(parseFloat(product.pricePerCubic) * volumePerPiece).toLocaleString('ru-RU')} ₽ за шт
                            </span>
                            <span className="text-sm text-gray-500">
                              {parseFloat(product.pricePerCubic).toLocaleString('ru-RU')} ₽/м³
                            </span>
                          </>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-forest-dark hover:bg-forest-light text-white">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            В корзину
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <OrderForm selectedProduct={product} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
