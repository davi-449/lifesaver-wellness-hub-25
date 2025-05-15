
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Droplet } from "lucide-react";
import { WaterTracker } from "@/components/fitness/WaterTracker";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { WorkoutForm } from "@/components/fitness/WorkoutForm";
import { MeasurementsForm } from "@/components/fitness/MeasurementsForm";
import { WorkoutHistory } from "@/components/fitness/WorkoutHistory";
import { MeasurementsHistory } from "@/components/fitness/MeasurementsHistory";

const FitnessPage = () => {
  // Mocked data for activity chart
  const workoutData = [
    { day: 'Seg', duration: 45, calories: 320 },
    { day: 'Ter', duration: 60, calories: 450 },
    { day: 'Qua', duration: 0, calories: 0 },
    { day: 'Qui', duration: 30, calories: 250 },
    { day: 'Sex', duration: 75, calories: 520 },
    { day: 'Sáb', duration: 90, calories: 650 },
    { day: 'Dom', duration: 0, calories: 0 },
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
            <WorkoutForm />
            <MeasurementsForm />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MeasurementsHistory />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>
                Duração dos treinos (minutos) e calorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
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
          <WorkoutHistory />
          <WaterTracker />
        </div>
      </div>
    </AppLayout>
  );
};

export default FitnessPage;
