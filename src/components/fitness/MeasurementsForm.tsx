
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp } from "lucide-react";

export function MeasurementsForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    body_fat: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements({
      ...measurements,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert empty strings to null
      const measurementsData = Object.entries(measurements).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : key === "notes" ? value : parseFloat(value);
        return acc;
      }, {} as Record<string, any>);

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          ...measurementsData,
          date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Medidas registradas com sucesso!",
        description: "Suas medidas foram adicionadas ao seu histórico."
      });

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar medidas:", error);
      toast({
        title: "Erro ao registrar medidas",
        description: "Houve um problema ao salvar suas medidas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMeasurements({
      weight: "",
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
      body_fat: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Medidas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Registrar Medidas Corporais
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input 
                id="weight" 
                name="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 70.5" 
                value={measurements.weight}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body_fat">% Gordura Corporal</Label>
              <Input 
                id="body_fat" 
                name="body_fat"
                type="number"
                step="0.1"
                placeholder="Ex: 15.5" 
                value={measurements.body_fat}
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
                placeholder="Ex: 95.0" 
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
                placeholder="Ex: 80.0" 
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
                placeholder="Ex: 100.0" 
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
                placeholder="Ex: 35.0" 
                value={measurements.arms}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thighs">Coxas (cm)</Label>
            <Input 
              id="thighs" 
              name="thighs"
              type="number"
              step="0.1"
              placeholder="Ex: 55.0" 
              value={measurements.thighs}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              name="notes"
              placeholder="Notas adicionais..." 
              value={measurements.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Medidas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
