
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, TrendingUp, Calendar, Droplet } from "lucide-react";
import { WaterTracker } from "@/components/fitness/WaterTracker";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const FitnessPage = () => {
  // Mock data for charts
  const weightData = [
    { date: '10/05', weight: 78.5 },
    { date: '11/05', weight: 78.3 },
    { date: '12/05', weight: 77.9 },
    { date: '13/05', weight: 77.7 },
    { date: '14/05', weight: 77.5 },
    { date: '15/05', weight: 77.2 },
    { date: '16/05', weight: 77.0 },
  ];

  const workoutData = [
    { day: 'Seg', duration: 45, calories: 320 },
    { day: 'Ter', duration: 60, calories: 450 },
    { day: 'Qua', duration: 0, calories: 0 },
    { day: 'Qui', duration: 30, calories: 250 },
    { day: 'Sex', duration: 75, calories: 520 },
    { day: 'Sáb', duration: 90, calories: 650 },
    { day: 'Dom', duration: 0, calories: 0 },
  ];

  // Workout history mock data
  const workouts = [
    {
      id: '1',
      title: 'Treino de Pernas',
      date: '16/05/2025',
      duration: 60,
      exercises: [
        { name: 'Agachamento', sets: 4, reps: 12, weight: 60 },
        { name: 'Leg Press', sets: 3, reps: 15, weight: 120 },
        { name: 'Extensora', sets: 3, reps: 12, weight: 40 },
        { name: 'Panturrilha', sets: 4, reps: 20, weight: 80 },
      ]
    },
    {
      id: '2',
      title: 'Cardio HIIT',
      date: '15/05/2025',
      duration: 30,
      exercises: [
        { name: 'Corrida (sprints)', duration: 20 },
        { name: 'Burpees', sets: 3, reps: 15 },
        { name: 'Mountain Climbers', sets: 3, reps: 20 },
        { name: 'Jumping Jacks', sets: 3, reps: 30 },
      ]
    },
    {
      id: '3',
      title: 'Treino de Peito e Tríceps',
      date: '14/05/2025',
      duration: 75,
      exercises: [
        { name: 'Supino Reto', sets: 4, reps: 10, weight: 70 },
        { name: 'Crucifixo', sets: 3, reps: 12, weight: 16 },
        { name: 'Tríceps Corda', sets: 3, reps: 15, weight: 25 },
        { name: 'Tríceps Francês', sets: 3, reps: 12, weight: 15 },
      ]
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fitness</h1>
            <p className="text-muted-foreground">
              Acompanhe seus treinos, medidas e progresso
            </p>
          </div>
          <div className="flex gap-2 sm:self-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Treino
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Medidas
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Progresso de Peso
              </CardTitle>
              <CardDescription>
                Últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="weight" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>
                Duração dos treinos (minutos) e calorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="duration" name="Minutos" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="calories" name="Calorias" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Histórico de Treinos
                </CardTitle>
                <CardDescription>
                  Seus últimos treinos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="bg-secondary/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{workout.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{workout.date}</span>
                          <Badge variant="outline" className="bg-primary/10">
                            {workout.duration} min
                          </Badge>
                        </div>
                      </div>
                      <div className="grid gap-2 mt-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="flex justify-between text-sm border-b border-secondary/20 pb-1">
                            <span>{exercise.name}</span>
                            <span>
                              {exercise.sets && exercise.reps 
                                ? `${exercise.sets}×${exercise.reps}${exercise.weight ? ` @ ${exercise.weight}kg` : ''}`
                                : exercise.duration ? `${exercise.duration} min` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button variant="ghost" size="sm">Ver Detalhes</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <WaterTracker />
        </div>
      </div>
    </AppLayout>
  );
};

function Badge({ variant, className, children }: { variant: string, className?: string, children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variant === 'outline' ? 'border border-secondary' : ''} ${className || ''}`}>
      {children}
    </div>
  );
}

export default FitnessPage;
