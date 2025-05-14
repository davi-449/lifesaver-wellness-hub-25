
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckSquare, LayoutDashboard, Dumbbell, Droplet } from "lucide-react";
import { TasksOverview } from "./TasksOverview";
import { WaterTracker } from "../fitness/WaterTracker";

export function DashboardSummary() {
  // Placeholder data
  const stats = [
    {
      title: "Tarefas Pendentes",
      value: "3",
      description: "2 de alta prioridade",
      icon: CheckSquare,
      color: "text-blue-500",
    },
    {
      title: "Eventos Hoje",
      value: "2",
      description: "Próximo em 2 horas",
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      title: "Treinos na Semana",
      value: "4/5",
      description: "80% do objetivo",
      icon: Dumbbell,
      color: "text-green-500",
    },
    {
      title: "Hidratação",
      value: "1.2/2.5L",
      description: "48% do objetivo diário",
      icon: Droplet,
      color: "text-blue-400",
      progress: 48,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu assistente de organização pessoal e fitness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              {stat.progress && (
                <Progress value={stat.progress} className="h-2 mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TasksOverview />
        <WaterTracker />
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
