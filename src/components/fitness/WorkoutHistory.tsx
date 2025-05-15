
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { CalendarClock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Workout {
  id: string;
  title: string;
  category: string;
  duration: number;
  date: string;
  notes?: string;
  exercises?: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number | null;
  duration?: number | null;
}

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      // First get the workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (workoutsError) throw workoutsError;
      
      if (workoutsData && workoutsData.length > 0) {
        // Get exercises for each workout
        const workoutsWithExercises = await Promise.all(
          workoutsData.map(async (workout) => {
            const { data: exercisesData, error: exercisesError } = await supabase
              .from('workout_exercises')
              .select('*')
              .eq('workout_id', workout.id)
              .order('id');
            
            if (exercisesError) throw exercisesError;
            
            return {
              ...workout,
              exercises: exercisesData
            };
          })
        );
        
        setWorkouts(workoutsWithExercises);
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'strength': return 'Força';
      case 'cardio': return 'Cardio';
      case 'flexibility': return 'Flexibilidade';
      case 'hiit': return 'HIIT';
      default: return 'Outro';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-blue-100 text-blue-800';
      case 'cardio': return 'bg-green-100 text-green-800';
      case 'flexibility': return 'bg-purple-100 text-purple-800';
      case 'hiit': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleWorkoutDetails = (id: string) => {
    setExpandedWorkoutId(expandedWorkoutId === id ? null : id);
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarClock className="mr-2 h-5 w-5 text-primary" />
          Histórico de Treinos
        </CardTitle>
        <CardDescription>
          Seus últimos treinos registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Carregando...</div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <p>Você ainda não registrou nenhum treino</p>
            <p className="text-sm mt-1">Use o botão "Registrar Treino" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-secondary/10 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{workout.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        className={getCategoryColor(workout.category)}
                        variant="outline"
                      >
                        {getCategoryLabel(workout.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <CalendarClock className="h-3.5 w-3.5 mr-1 inline" />
                        {format(parseISO(workout.date), "dd/MM/yyyy • HH:mm")}
                      </span>
                      <Badge variant="outline" className="bg-primary/10">
                        {workout.duration} min
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {workout.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {workout.notes}
                  </p>
                )}
                
                {expandedWorkoutId === workout.id && workout.exercises && (
                  <div className="mt-4 border-t border-secondary/20 pt-2">
                    <h4 className="font-medium mb-2">Exercícios</h4>
                    <div className="space-y-1.5">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex justify-between text-sm border-b border-secondary/10 pb-1 last:border-0">
                          <span>{exercise.name}</span>
                          <span>
                            {`${exercise.sets}×${exercise.reps}${exercise.weight ? ` @ ${exercise.weight}kg` : ''}`}
                            {exercise.duration ? ` (${exercise.duration}s)` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleWorkoutDetails(workout.id)}
                  >
                    {expandedWorkoutId === workout.id ? "Ocultar Detalhes" : "Ver Detalhes"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
