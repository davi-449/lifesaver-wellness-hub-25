
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckSquare, Dumbbell, Droplet } from "lucide-react";
import { TasksOverview } from "./TasksOverview";
import { WaterTracker } from "../fitness/WaterTracker";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardSummary() {
  const navigate = useNavigate();
  
  // Placeholder data
  const stats = [
    {
      title: "Tarefas Pendentes",
      value: "3",
      description: "2 de alta prioridade",
      icon: CheckSquare,
      color: "text-primary",
      path: "/tasks",
      filterParams: "?status=pending",
    },
    {
      title: "Eventos Hoje",
      value: "2",
      description: "Próximo em 2 horas",
      icon: Calendar,
      color: "text-secondary",
      path: "/calendar",
    },
    {
      title: "Treinos na Semana",
      value: "4/5",
      description: "80% do objetivo",
      icon: Dumbbell,
      color: "text-emerald-400",
      path: "/fitness",
    },
    {
      title: "Hidratação",
      value: "1.2/2.5L",
      description: "48% do objetivo diário",
      icon: Droplet,
      color: "text-sky-400",
      progress: 48,
      path: "/fitness",
      filterParams: "?section=water",
    },
  ];

  const handleCardClick = (path: string, filterParams?: string) => {
    navigate(path + (filterParams || ''));
  };

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
          <Card 
            key={index} 
            className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => handleCardClick(stat.path, stat.filterParams)}
          >
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
