
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function WaterTracker() {
  const { toast } = useToast();
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal, setGoal] = useState(2000); // Default goal: 2000ml
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load water intake data for today
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        // Get user's water intake goal
        const { data: profile } = await supabase
          .from('profiles')
          .select('water_intake_goal')
          .eq('id', user.id)
          .single();
          
        if (profile?.water_intake_goal) {
          setGoal(profile.water_intake_goal);
        }
        
        // Get today's water intake
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: waterData } = await supabase
          .from('water_intake')
          .select('amount')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
          
        if (waterData) {
          setWaterIntake(waterData.amount);
        }
      } catch (error) {
        console.error("Error loading water data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de hidratação",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWaterData();
  }, [toast]);

  const updateWaterIntake = async (amount: number) => {
    // Prevent negative values
    if (waterIntake + amount < 0) return;
    
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const newAmount = waterIntake + amount;
      setWaterIntake(newAmount);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if there's an entry for today
      const { data: existingEntry } = await supabase
        .from('water_intake')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
        
      if (existingEntry) {
        // Update existing entry
        await supabase
          .from('water_intake')
          .update({ amount: newAmount })
          .eq('id', existingEntry.id);
      } else {
        // Create new entry
        await supabase
          .from('water_intake')
          .insert({ 
            user_id: user.id,
            date: today, 
            amount: newAmount 
          });
      }
      
      // Show toast for significant achievements
      if (newAmount >= goal && waterIntake < goal) {
        toast({
          title: "Meta diária atingida!",
          description: "Você alcançou sua meta de hidratação para hoje. Parabéns!"
        });
      } else if (amount > 0) {
        toast({
          title: "Hidratação registrada",
          description: `+${amount}ml adicionados ao seu progresso`
        });
      }
      
    } catch (error: any) {
      console.error("Error updating water intake:", error);
      toast({
        title: "Erro ao atualizar hidratação",
        description: error.message || "Não foi possível salvar seu progresso",
        variant: "destructive"
      });
      setWaterIntake(waterIntake); // Revert back
    } finally {
      setIsSaving(false);
    }
  };

  const percentage = Math.min(Math.round((waterIntake / goal) * 100), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Droplet className="mr-2 text-blue-400" />
          Hidratação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-6 w-6 border-b-2 border-blue-400 rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{waterIntake}</span>
              <span className="text-muted-foreground">/{goal} ml</span>
            </div>
            
            <Progress value={percentage} className="h-3" />
            
            <div className="text-center text-muted-foreground">
              {percentage}% da meta diária
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="icon"
          disabled={waterIntake <= 0 || isSaving}
          onClick={() => updateWaterIntake(-250)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline"
            disabled={isSaving}
            onClick={() => updateWaterIntake(100)}
          >
            +100ml
          </Button>
          <Button 
            variant="outline"
            disabled={isSaving}
            onClick={() => updateWaterIntake(250)}
          >
            +250ml
          </Button>
          <Button 
            variant="default"
            disabled={isSaving}
            onClick={() => updateWaterIntake(500)}
          >
            +500ml
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          disabled={isSaving}
          onClick={() => updateWaterIntake(1000)}
          className="text-xs"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
