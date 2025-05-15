
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

export function MeasurementsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [measurements, setMeasurements] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    notes: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const currentDate = format(new Date(), "yyyy-MM-dd");
      
      // First check if there's already an entry for today
      const { data: existingData } = await supabase
        .from('body_measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', currentDate)
        .maybeSingle();
      
      const measurementData = {
        user_id: user.id,
        date: currentDate,
        weight: measurements.weight ? parseFloat(measurements.weight) : null,
        body_fat: measurements.bodyFat ? parseFloat(measurements.bodyFat) : null,
        chest: measurements.chest ? parseFloat(measurements.chest) : null,
        waist: measurements.waist ? parseFloat(measurements.waist) : null,
        hips: measurements.hips ? parseFloat(measurements.hips) : null,
        arms: measurements.arms ? parseFloat(measurements.arms) : null,
        thighs: measurements.thighs ? parseFloat(measurements.thighs) : null,
        notes: measurements.notes
      };
      
      let result;
      
      if (existingData?.id) {
        // Update existing record
        result = await supabase
          .from('body_measurements')
          .update(measurementData)
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('body_measurements')
          .insert(measurementData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Medidas registradas com sucesso",
        description: "Suas medidas corporais foram salvas"
      });
      
      // Clear form
      setMeasurements({
        weight: "",
        bodyFat: "",
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        thighs: "",
        notes: ""
      });
      
    } catch (error: any) {
      console.error("Error saving measurements:", error);
      toast({
        title: "Erro ao salvar medidas",
        description: error.message || "Não foi possível salvar suas medidas",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registrar Medidas</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input 
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={measurements.weight}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
              <Input 
                id="bodyFat"
                name="bodyFat"
                type="number"
                step="0.1"
                placeholder="15.0"
                value={measurements.bodyFat}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chest">Peito (cm)</Label>
              <Input 
                id="chest"
                name="chest"
                type="number"
                step="0.1"
                placeholder="90.0"
                value={measurements.chest}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Cintura (cm)</Label>
              <Input 
                id="waist"
                name="waist"
                type="number"
                step="0.1"
                placeholder="80.0"
                value={measurements.waist}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hips">Quadril (cm)</Label>
              <Input 
                id="hips"
                name="hips"
                type="number"
                step="0.1"
                placeholder="95.0"
                value={measurements.hips}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arms">Braços (cm)</Label>
              <Input 
                id="arms"
                name="arms"
                type="number"
                step="0.1"
                placeholder="35.0"
                value={measurements.arms}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thighs">Coxas (cm)</Label>
              <Input 
                id="thighs"
                name="thighs"
                type="number"
                step="0.1"
                placeholder="55.0"
                value={measurements.thighs}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes"
              name="notes"
              placeholder="Adicione notas sobre sua medição..."
              value={measurements.notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                Salvando...
              </span>
            ) : "Salvar Medidas"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
