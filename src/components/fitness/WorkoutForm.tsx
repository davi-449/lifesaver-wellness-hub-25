
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function WorkoutForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workout, setWorkout] = useState({
    title: "",
    category: "cardio",
    duration: 30,
    notes: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkout(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setWorkout(prev => ({ ...prev, category: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout.title || workout.duration <= 0) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha o título e a duração do treino.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const result = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          title: workout.title,
          category: workout.category,
          duration: workout.duration,
          notes: workout.notes,
          date: format(new Date(), "yyyy-MM-dd")
        });

      if (result.error) throw result.error;
      
      toast({
        title: "Treino registrado com sucesso",
        description: "Seu treino foi salvo no histórico."
      });
      
      // Clear form
      setWorkout({
        title: "",
        category: "cardio",
        duration: 30,
        notes: ""
      });
      
    } catch (error: any) {
      console.error("Error saving workout:", error);
      toast({
        title: "Erro ao salvar treino",
        description: error.message || "Não foi possível salvar seu treino",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registrar Treino</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome do Treino</Label>
            <Input 
              id="title"
              name="title"
              placeholder="Ex: Corrida no parque"
              value={workout.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={workout.category} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Musculação</SelectItem>
                  <SelectItem value="flexibility">Flexibilidade</SelectItem>
                  <SelectItem value="sports">Esportes</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input 
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={workout.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes"
              name="notes"
              placeholder="Detalhes sobre o treino, intensidade, exercícios realizados..."
              value={workout.notes}
              onChange={handleChange}
              rows={3}
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
            ) : "Registrar Treino"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
