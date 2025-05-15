
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, X, Plus } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
  duration: number | null;
};

export function WorkoutForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("strength");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: crypto.randomUUID(), name: "", sets: 3, reps: 12, weight: null, duration: null }
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: crypto.randomUUID(), name: "", sets: 3, reps: 12, weight: null, duration: null }
    ]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(exercise => exercise.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Insert the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          title,
          category,
          duration,
          notes,
          date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;
      
      // 2. Insert the exercises
      const exercisesToInsert = exercises.map(exercise => ({
        workout_id: workout.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
      }));
      
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);
      
      if (exercisesError) throw exercisesError;
      
      toast({
        title: "Treino registrado com sucesso!",
        description: "Seu treino foi adicionado ao seu histórico."
      });
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      toast({
        title: "Erro ao registrar treino",
        description: "Houve um problema ao salvar seu treino. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setCategory("strength");
    setDuration(30);
    setNotes("");
    setExercises([
      { id: crypto.randomUUID(), name: "", sets: 3, reps: 12, weight: null, duration: null }
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Treino
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Dumbbell className="mr-2 h-5 w-5 text-primary" />
            Registrar Novo Treino
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do Treino</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Treino de Pernas" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Força</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibilidade</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input 
                id="duration" 
                type="number" 
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Exercícios</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addExercise}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="relative">
                    <CardContent className="pt-4">
                      <div className="absolute top-2 right-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => removeExercise(exercise.id)}
                          disabled={exercises.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`ex-name-${index}`}>Nome do Exercício</Label>
                            <Input 
                              id={`ex-name-${index}`}
                              value={exercise.name}
                              onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                              placeholder="Ex: Agachamento"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`ex-weight-${index}`}>Peso (kg)</Label>
                            <Input 
                              id={`ex-weight-${index}`}
                              type="number"
                              value={exercise.weight || ''}
                              onChange={(e) => updateExercise(
                                exercise.id, 
                                'weight', 
                                e.target.value ? parseFloat(e.target.value) : null
                              )}
                              placeholder="Ex: 60"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`ex-sets-${index}`}>Séries</Label>
                            <Input 
                              id={`ex-sets-${index}`}
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(
                                exercise.id, 
                                'sets', 
                                parseInt(e.target.value)
                              )}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`ex-reps-${index}`}>Repetições</Label>
                            <Input 
                              id={`ex-reps-${index}`}
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(
                                exercise.id, 
                                'reps', 
                                parseInt(e.target.value)
                              )}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`ex-duration-${index}`}>Duração (segundos, opcional)</Label>
                          <Input 
                            id={`ex-duration-${index}`}
                            type="number"
                            min="0"
                            value={exercise.duration || ''}
                            onChange={(e) => updateExercise(
                              exercise.id, 
                              'duration', 
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            placeholder="Ex: 60 (para exercícios isométricos)"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Notas sobre o treino..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
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
              {loading ? "Salvando..." : "Salvar Treino"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
