import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, ShoppingCart } from "lucide-react";
import OrderForm from "./order-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CalculationResult {
  dimensions: string;
  quantity: number;
  volumePerPiece?: number;
  areaPerPiece?: number;
  totalVolume?: number;
  totalArea?: number;
  totalPrice: number;
  pricePerUnit: number;
  unitType: string;
}

export default function Calculator() {
  const [sawType, setSawType] = useState("band");
  const [thickness, setThickness] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const calculate = () => {
    if (!thickness || !width || !length || !quantity) return;

    const t = parseFloat(thickness);
    const w = parseFloat(width);
    const l = parseFloat(length);
    const q = parseInt(quantity);

    if (l > 6) {
      alert("Максимальная длина доски 6 метров!");
      return;
    }

    // Find matching product or use default prices
    const matchingProduct = products?.find((p: any) => 
      p.sawType === sawType && 
      p.thickness === t && 
      p.width === w && 
      Math.abs(parseFloat(p.length) - l) < 0.1
    );

    let pricePerUnit = 0;
    let unitType = "";

    if (matchingProduct) {
      if (sawType === "planed") {
        pricePerUnit = parseFloat(matchingProduct.pricePerSquare || "0");
        unitType = "м²";
      } else {
        pricePerUnit = parseFloat(matchingProduct.pricePerCubic || "0");
        unitType = "м³";
      }
    } else {
      // Default prices if no matching product
      const defaultPrices = {
        band: 8500,
        disc: 7800,
        planed: 850,
        dried: 9200
      };
      
      pricePerUnit = defaultPrices[sawType as keyof typeof defaultPrices] || 8000;
      unitType = sawType === "planed" ? "м²" : "м³";
    }

    if (sawType === "planed") {
      // For planed boards, calculate in square meters
      const areaPerPiece = (w * l) / 1000; // Convert mm*m to m²
      const totalArea = areaPerPiece * q;
      const totalPrice = totalArea * pricePerUnit;

      setResult({
        dimensions: `${t}×${w}×${l*1000} мм`,
        quantity: q,
        areaPerPiece,
        totalArea,
        totalPrice,
        pricePerUnit,
        unitType
      });
    } else {
      // For other types, calculate in cubic meters
      const volumePerPiece = (t * w * l) / 1000000; // Convert mm³ to m³
      const totalVolume = volumePerPiece * q;
      const totalPrice = totalVolume * pricePerUnit;

      setResult({
        dimensions: `${t}×${w}×${l*1000} мм`,
        quantity: q,
        volumePerPiece,
        totalVolume,
        totalPrice,
        pricePerUnit,
        unitType
      });
    }

    setSelectedProduct(matchingProduct);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-4">
          <CalcIcon className="h-12 w-12 text-amber" />
          Калькулятор стоимости
        </h2>
        <p className="text-xl max-w-3xl mx-auto">
          Рассчитайте точную стоимость пиломатериалов для вашего проекта
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            <div>
              <Label className="text-white">Тип пиления</Label>
              <Select value={sawType} onValueChange={setSawType}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
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
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Толщина (мм)</Label>
                <Input 
                  type="number" 
                  placeholder="50"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <Label className="text-white">Ширина (мм)</Label>
                <Input 
                  type="number" 
                  placeholder="150"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <Label className="text-white">Длина (м)</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  max="6" 
                  placeholder="6.0"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Количество (шт)</Label>
              <Input 
                type="number" 
                placeholder="20"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
              />
            </div>
            
            <Button 
              onClick={calculate}
              className="w-full bg-amber hover:bg-amber/90 text-forest-dark font-semibold"
              size="lg"
            >
              <CalcIcon className="mr-2 h-5 w-5" />
              Рассчитать стоимость
            </Button>
          </div>
          
          {/* Calculation Results */}
          <Card className="bg-white/20 border-white/30">
            <CardHeader>
              <CardTitle className="text-white">Результат расчета</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4 text-white">
                  <div className="flex justify-between">
                    <span>Размер доски:</span>
                    <span className="font-medium">{result.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Количество:</span>
                    <span className="font-medium">{result.quantity} шт</span>
                  </div>
                  {result.volumePerPiece && (
                    <>
                      <div className="flex justify-between">
                        <span>Объем одной доски:</span>
                        <span className="font-medium">{result.volumePerPiece.toFixed(3)} м³</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Общий объем:</span>
                        <span className="font-medium">{result.totalVolume?.toFixed(3)} м³</span>
                      </div>
                    </>
                  )}
                  {result.areaPerPiece && (
                    <>
                      <div className="flex justify-between">
                        <span>Площадь одной доски:</span>
                        <span className="font-medium">{result.areaPerPiece.toFixed(3)} м²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Общая площадь:</span>
                        <span className="font-medium">{result.totalArea?.toFixed(3)} м²</span>
                      </div>
                    </>
                  )}
                  <hr className="border-white/30" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-amber">{result.totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="text-sm text-white/70">
                    * Цена указана без учета доставки
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-white/20 border border-white/30 text-white hover:bg-white/30">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Оформить заказ
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <OrderForm 
                        selectedProduct={selectedProduct}
                        calculationResult={result}
                        customDimensions={!selectedProduct ? {
                          thickness: parseInt(thickness),
                          width: parseInt(width),
                          length: parseFloat(length),
                          sawType,
                          quantity: parseInt(quantity)
                        } : undefined}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-center text-white/70 py-8">
                  Введите параметры доски для расчета стоимости
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
