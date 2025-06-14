import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, FileText, Ruler, ShoppingCart } from "lucide-react";
import OrderForm from "./order-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CalculationResult {
  dimensions: string;
  quantity: number;
  grade: string;
  volumePerPiece?: number;
  areaPerPiece?: number;
  totalVolume?: number;
  totalArea?: number;
  totalPrice: number;
  pricePerUnit: number;
  unitType: string;
  sawType: string;
}

interface GostSize {
  name: string;
  thickness: number;
  width: number;
  length: number;
  category: string;
}

const gostSizes: GostSize[] = [
  // Доски обрезные ГОСТ 8486-86
  { name: "Доска 25×100×6000", thickness: 25, width: 100, length: 6.0, category: "standard" },
  { name: "Доска 25×150×6000", thickness: 25, width: 150, length: 6.0, category: "standard" },
  { name: "Доска 32×100×6000", thickness: 32, width: 100, length: 6.0, category: "standard" },
  { name: "Доска 32×150×6000", thickness: 32, width: 150, length: 6.0, category: "standard" },
  { name: "Доска 40×100×6000", thickness: 40, width: 100, length: 6.0, category: "standard" },
  { name: "Доска 40×150×6000", thickness: 40, width: 150, length: 6.0, category: "standard" },
  { name: "Доска 50×100×6000", thickness: 50, width: 100, length: 6.0, category: "standard" },
  { name: "Доска 50×150×6000", thickness: 50, width: 150, length: 6.0, category: "standard" },
  { name: "Доска 50×200×6000", thickness: 50, width: 200, length: 6.0, category: "standard" },
  
  // Брус ГОСТ 8486-86
  { name: "Брус 100×100×6000", thickness: 100, width: 100, length: 6.0, category: "timber" },
  { name: "Брус 100×150×6000", thickness: 100, width: 150, length: 6.0, category: "timber" },
  { name: "Брус 150×150×6000", thickness: 150, width: 150, length: 6.0, category: "timber" },
  { name: "Брус 150×200×6000", thickness: 150, width: 200, length: 6.0, category: "timber" },
  { name: "Брус 200×200×6000", thickness: 200, width: 200, length: 6.0, category: "timber" },
  
  // Рейки и планки
  { name: "Рейка 20×40×3000", thickness: 20, width: 40, length: 3.0, category: "slats" },
  { name: "Рейка 25×50×3000", thickness: 25, width: 50, length: 3.0, category: "slats" },
  { name: "Планка 40×60×3000", thickness: 40, width: 60, length: 3.0, category: "slats" },
];

const getWoodTypeName = (woodType: string) => {
  const names = {
    pine: "сосновые",
    spruce: "еловые", 
    larch: "лиственничные",
    birch: "березовые",
    aspen: "осиновые"
  };
  return names[woodType as keyof typeof names] || woodType;
};

export default function Calculator() {
  const [calculationType, setCalculationType] = useState<"custom" | "gost" | "firewood">("custom");
  const [sawType, setSawType] = useState<string>("band");
  const [woodType, setWoodType] = useState<string>("pine");
  const [grade, setGrade] = useState<string>("2");
  const [thickness, setThickness] = useState<number>(50);
  const [width, setWidth] = useState<number>(150);
  const [length, setLength] = useState<number>(6.0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedGostSize, setSelectedGostSize] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const basePrices = {
    band: 8500,    // ₽ за м³
    disc: 7800,    // ₽ за м³
    planed: 850,   // ₽ за м² (строганые)
    dried: 9200,   // ₽ за м³
  };

  const woodMultipliers = {
    pine: 1.0,      // сосна - базовая цена
    spruce: 1.0,    // ель - базовая цена
    larch: 1.4,     // лиственница - +40%
    birch: 1.2,     // береза - +20%
    aspen: 0.9,     // осина - -10%
  };

  const firewoodPrices = {
    pine: 2800,     // ₽ за м³
    spruce: 2800,   // ₽ за м³
    birch: 3500,    // ₽ за м³
    aspen: 2500,    // ₽ за м³
    larch: 3800,    // ₽ за м³
  };

  const gradeMultipliers = {
    "1": 1.2,  // 1 сорт - +20%
    "2": 1.0,  // 2 сорт - базовая цена
    "3": 0.8,  // 3 сорт - -20%
  };

  const handleGostSizeChange = (value: string) => {
    setSelectedGostSize(value);
    const gostSize = gostSizes.find(size => size.name === value);
    if (gostSize) {
      setThickness(gostSize.thickness);
      setWidth(gostSize.width);
      setLength(gostSize.length);
    }
  };

  const calculate = () => {
    if (calculationType === "firewood") {
      // Расчет для дров
      if (quantity <= 0 || !woodType) return;
      
      const pricePerCubic = firewoodPrices[woodType as keyof typeof firewoodPrices];
      const totalPrice = quantity * pricePerCubic;
      
      setResult({
        dimensions: `Дрова ${getWoodTypeName(woodType)}`,
        quantity,
        grade: "Колотые",
        totalVolume: quantity,
        totalPrice,
        pricePerUnit: pricePerCubic,
        unitType: "м³",
        sawType: "firewood"
      });
      return;
    }

    // Расчет для пиломатериалов
    if (!sawType || thickness <= 0 || width <= 0 || length <= 0 || quantity <= 0) {
      return;
    }

    const thicknessM = thickness / 1000;
    const widthM = width / 1000;

    let totalPrice = 0;
    let basePricePerUnit = 0;
    let unitType = "";
    let volumePerPiece: number | undefined;
    let areaPerPiece: number | undefined;
    let totalVolume: number | undefined;
    let totalArea: number | undefined;

    if (sawType === "planed") {
      // Строганые доски считаются в м²
      areaPerPiece = widthM * length;
      totalArea = areaPerPiece * quantity; 
      basePricePerUnit = basePrices.planed;
      unitType = "м²";
    } else {
      // Остальные считаются в м³
      volumePerPiece = thicknessM * widthM * length;
      totalVolume = volumePerPiece * quantity;
      basePricePerUnit = basePrices[sawType as keyof typeof basePrices] || 0;
      unitType = "м³";
    }

    // Применяем коэффициенты породы и сорта
    const woodMultiplier = woodMultipliers[woodType as keyof typeof woodMultipliers];
    const gradeMultiplier = gradeMultipliers[grade as keyof typeof gradeMultipliers];
    const pricePerUnit = basePricePerUnit * woodMultiplier * gradeMultiplier;
    
    if (sawType === "planed") {
      totalPrice = totalArea! * pricePerUnit;
    } else {
      totalPrice = totalVolume! * pricePerUnit;
    }

    const gradeNames = {
      "1": "1-й сорт",
      "2": "2-й сорт", 
      "3": "3-й сорт"
    };

    setResult({
      dimensions: `${thickness}×${width}×${length * 1000}`,
      quantity,
      grade: gradeNames[grade as keyof typeof gradeNames],
      volumePerPiece,
      areaPerPiece,
      totalVolume,
      totalArea,
      totalPrice,
      pricePerUnit,
      unitType,
      sawType,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="card-hover shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-forest-light to-amber/10">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl text-forest-dark">
            <CalcIcon className="h-8 w-8 text-amber" />
            Калькулятор пиломатериалов
          </CardTitle>
          <p className="text-gray-600 mt-2">Расчет по ГОСТ или индивидуальным размерам</p>
        </CardHeader>
        <CardContent className="p-8">
          <Tabs value={calculationType} onValueChange={(v) => setCalculationType(v as "custom" | "gost" | "firewood")} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Свой размер
              </TabsTrigger>
              <TabsTrigger value="gost" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Стандартные размеры
              </TabsTrigger>
              <TabsTrigger value="firewood" className="flex items-center gap-2">
                🔥 Дрова
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Input Section */}
              <div className="space-y-6">
                <TabsContent value="gost" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Выберите стандартный размер
                      </Label>
                      <Select value={selectedGostSize} onValueChange={handleGostSizeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите размер по ГОСТ" />
                        </SelectTrigger>
                        <SelectContent>
                          {gostSizes.filter(s => s.category === "standard").map(size => (
                            <SelectItem key={size.name} value={size.name}>
                              {size.name}
                            </SelectItem>
                          ))}
                          {gostSizes.filter(s => s.category === "timber").map(size => (
                            <SelectItem key={size.name} value={size.name}>
                              {size.name}
                            </SelectItem>
                          ))}
                          {gostSizes.filter(s => s.category === "slats").map(size => (
                            <SelectItem key={size.name} value={size.name}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Толщина (мм)
                      </Label>
                      <Input
                        type="number"
                        value={thickness}
                        onChange={(e) => setThickness(Number(e.target.value))}
                        min="1"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Ширина (мм)
                      </Label>
                      <Input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        min="1"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Длина (м)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        min="0.1"
                        max="6"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="firewood" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Порода древесины
                      </Label>
                      <Select value={woodType} onValueChange={setWoodType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите породу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pine">Сосна (2800 ₽/м³)</SelectItem>
                          <SelectItem value="spruce">Ель (2800 ₽/м³)</SelectItem>
                          <SelectItem value="birch">Береза (3500 ₽/м³)</SelectItem>
                          <SelectItem value="aspen">Осина (2500 ₽/м³)</SelectItem>
                          <SelectItem value="larch">Лиственница (3800 ₽/м³)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Объем (м³)
                      </Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        step="0.5"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </TabsContent>

                {calculationType !== "firewood" && (
                  <>
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Порода древесины
                      </Label>
                      <Select value={woodType} onValueChange={setWoodType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите породу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pine">Сосна (базовая цена)</SelectItem>
                          <SelectItem value="spruce">Ель (базовая цена)</SelectItem>
                          <SelectItem value="larch">Лиственница (+40%)</SelectItem>
                          <SelectItem value="birch">Береза (+20%)</SelectItem>
                          <SelectItem value="aspen">Осина (-10%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-forest-dark font-medium">
                        Тип пиления
                      </Label>
                      <Select value={sawType} onValueChange={setSawType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип пиления" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="band">Ленточное пиление</SelectItem>
                          <SelectItem value="disc">Дисковое пиление</SelectItem>
                          <SelectItem value="planed">Строганые доски</SelectItem>
                          <SelectItem value="dried">Доска после сушилки</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {calculationType !== "firewood" && (
                  <>
                    <div>
                      <Label className="text-forest-dark font-medium">
                        Сорт древесины
                      </Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1-й сорт (+20% к цене)</SelectItem>
                          <SelectItem value="2">2-й сорт (стандартная цена)</SelectItem>
                          <SelectItem value="3">3-й сорт (-20% к цене)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-forest-dark font-medium">
                        Количество (шт)
                      </Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="border-gray-300"
                      />
                    </div>
                  </>
                )}

                <Button 
                  onClick={calculate} 
                  className="w-full bg-amber hover:bg-amber/90 text-forest-dark font-semibold py-3 text-lg"
                >
                  <CalcIcon className="mr-2 h-5 w-5" />
                  Рассчитать стоимость
                </Button>
              </div>

              {/* Result Section */}
              <div className="space-y-4">
                {result ? (
                  <Card className="bg-gradient-to-br from-forest-light to-amber/10 border-amber shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl text-forest-dark flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber" />
                        Результат расчета
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Размеры:</span>
                          <span className="font-medium">{result.dimensions} мм</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Количество:</span>
                          <span className="font-medium">{result.quantity} шт</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Сорт:</span>
                          <span className="font-medium">{result.grade}</span>
                        </div>
                        {result.volumePerPiece && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Объем за штуку:</span>
                            <span className="font-medium">{result.volumePerPiece.toFixed(4)} м³</span>
                          </div>
                        )}
                        {result.areaPerPiece && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Площадь за штуку:</span>
                            <span className="font-medium">{result.areaPerPiece.toFixed(4)} м²</span>
                          </div>
                        )}
                        {result.totalVolume && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Общий объем:</span>
                            <span className="font-medium">{result.totalVolume.toFixed(4)} м³</span>  
                          </div>
                        )}
                        {result.totalArea && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Общая площадь:</span>
                            <span className="font-medium">{result.totalArea.toFixed(4)} м²</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Цена за {result.unitType}:</span>
                          <span className="font-medium">{result.pricePerUnit.toLocaleString()} ₽</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-forest-dark border-t border-amber pt-4">
                        <span>Общая стоимость:</span>
                        <span className="text-amber">{result.totalPrice.toLocaleString()} ₽</span>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-forest-dark hover:bg-forest-dark/90 text-white">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Оформить заказ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <OrderForm 
                            calculationResult={result}
                            customDimensions={{
                              thickness,
                              width,
                              length,
                              sawType,
                              quantity
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-50 border-dashed border-gray-300">
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center text-gray-500">
                        <CalcIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">Калькулятор готов к работе</p>
                        <p className="text-sm">Выберите размеры и параметры для расчета</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}