
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function WaterTracker() {
  const { toast } = useToast();
  const [waterIntake, setWaterIntake] = useState(0);
  const [targetIntake, setTargetIntake] = useState(2500);
  const [loading, setLoading] = useState(true);
  const glassSize = 250; // ml
  
  const percentComplete = Math.min(Math.round((waterIntake / targetIntake) * 100), 100);
  
  useEffect(() => {
    fetchWaterIntake();
    fetchWaterGoal();
  }, []);
  
  const fetchWaterGoal = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('water_intake_goal')
        .single();
      
      if (error) throw error;
      
      if (profile && profile.water_intake_goal) {
        setTargetIntake(profile.water_intake_goal);
      }
    } catch (error) {
      console.error("Erro ao buscar meta de hidratação:", error);
    }
  };
  
  const fetchWaterIntake = async () => {
    try {
      // Get today's water intake
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('water_intake')
        .select('amount')
        .gte('date', today.toISOString())
        .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      // Sum all water intake for today
      const totalIntake = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      setWaterIntake(totalIntake);
    } catch (error) {
      console.error("Erro ao buscar hidratação:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const addWater = async () => {
    const newIntake = waterIntake + glassSize;
    
    try {
      const { error } = await supabase
        .from('water_intake')
        .insert({
          amount: glassSize,
          date: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setWaterIntake(newIntake);
      
      if (newIntake >= targetIntake && waterIntake < targetIntake) {
        toast({
          title: "Meta de hidratação atingida!",
          description: "Você atingiu sua meta diária de hidratação. Parabéns!",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
      toast({
        title: "Erro ao registrar hidratação",
        description: "Não foi possível registrar sua hidratação. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const removeWater = async () => {
    if (waterIntake <= 0) return;
    
    try {
      // First we need to find the most recent water intake record
      const { data, error: fetchError } = await supabase
        .from('water_intake')
        .select('id, amount')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const { error } = await supabase
          .from('water_intake')
          .delete()
          .eq('id', data[0].id);
        
        if (error) throw error;
        
        setWaterIntake(Math.max(0, waterIntake - data[0].amount));
      }
    } catch (error) {
      console.error("Erro ao remover água:", error);
      toast({
        title: "Erro ao remover hidratação",
        description: "Não foi possível remover o registro de hidratação. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Generate water drops based on waterIntake
  const waterDrops = [];
  const totalDrops = Math.floor(targetIntake / glassSize);
  const filledDrops = Math.min(Math.floor(waterIntake / glassSize), totalDrops);
  
  for (let i = 0; i < totalDrops; i++) {
    const isFilled = i < filledDrops;
    
    waterDrops.push(
      <div 
        key={i} 
        className={`inline-flex items-center justify-center rounded-full w-8 h-8 ${
          isFilled ? 'bg-blue-500' : 'bg-blue-200'
        }`}
        title={`${(i + 1) * glassSize}ml`}
      >
        <Droplet className="h-4 w-4 text-white" />
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
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            Carregando...
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
