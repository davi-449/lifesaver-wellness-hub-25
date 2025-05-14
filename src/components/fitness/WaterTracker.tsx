
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export function WaterTracker() {
  const { toast } = useToast();
  const [waterIntake, setWaterIntake] = useState(1200); // ml
  const targetIntake = 2500; // ml
  const glassSize = 250; // ml
  
  const percentComplete = Math.min(Math.round((waterIntake / targetIntake) * 100), 100);
  
  const addWater = () => {
    const newIntake = waterIntake + glassSize;
    setWaterIntake(newIntake);
    
    if (newIntake >= targetIntake && waterIntake < targetIntake) {
      toast({
        title: "Meta de hidratação atingida!",
        description: "Você atingiu sua meta diária de hidratação. Parabéns!",
      });
    }
  };
  
  const removeWater = () => {
    setWaterIntake(Math.max(0, waterIntake - glassSize));
  };
  
  // Generate water drops based on waterIntake
  const waterDrops = [];
  const totalDrops = Math.floor(targetIntake / glassSize);
  const filledDrops = Math.min(Math.floor(waterIntake / glassSize), totalDrops);
  
  for (let i = 0; i < totalDrops; i++) {
    waterDrops.push(
      <div 
        key={i} 
        className={`water-drop ${i < filledDrops ? 'water-drop-active' : 'bg-blue-200'}`}
        title={`${(i + 1) * glassSize}ml`}
      >
        <Droplet className="h-3 w-3 text-white" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Droplet className="mr-2 h-5 w-5 text-blue-500" />
          Hidratação
        </CardTitle>
        <CardDescription>
          Acompanhe seu consumo diário de água
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <span className="text-3xl font-bold">{(waterIntake / 1000).toFixed(1)}L</span>
          <span className="text-muted-foreground"> / {(targetIntake / 1000).toFixed(1)}L</span>
        </div>
        
        <Progress value={percentComplete} className="h-2 mb-6" />
        
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {waterDrops}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={removeWater}
            disabled={waterIntake <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button onClick={addWater} className="px-6">
            <Droplet className="mr-2 h-4 w-4" />
            Adicionar {glassSize}ml
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
