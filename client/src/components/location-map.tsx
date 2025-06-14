import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";

export default function LocationMap() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-forest-light to-amber/10">
          <CardTitle className="flex items-center gap-2 text-2xl text-forest-dark">
            <MapPin className="h-6 w-6 text-amber" />
            Наше местоположение
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Map Container */}
            <div className="relative h-96 bg-gray-100 flex items-center justify-center">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=37.5%2C55.7%2C37.7%2C55.8&layer=mapnik&marker=55.7558%2C37.6176"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            
            {/* Contact Information */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-forest-dark mb-4">
                  Контактная информация
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-amber mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-forest-dark">Адрес:</p>
                      <p className="text-gray-600">
                        Московская область, Дмитровский район<br />
                        деревня Лесная, участок 15
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-amber mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-forest-dark">Телефон:</p>
                      <p className="text-gray-600">+7 (495) 123-45-67</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-forest-dark">Часы работы:</p>
                      <p className="text-gray-600">
                        Пн-Пт: 8:00 - 18:00<br />
                        Сб: 9:00 - 16:00<br />
                        Вс: выходной
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-amber mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-forest-dark">Как добраться:</p>
                      <p className="text-gray-600">
                        От метро Дмитровская на автобусе №401<br />
                        до остановки "Лесная"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber/10 p-4 rounded-lg">
                <p className="text-sm text-forest-dark font-medium mb-2">
                  📋 Важная информация:
                </p>
                <p className="text-sm text-gray-700">
                  Самовывоз возможен в любое рабочее время. 
                  Для крупных заказов рекомендуем предварительно согласовать время.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}