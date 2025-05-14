
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function TasksOverview() {
  const navigate = useNavigate();
  
  // Mock data
  const todayTasks = [
    { 
      id: "1", 
      title: "Reunião de equipe", 
      time: "10:00", 
      category: "work",
      priority: "high",
      status: "pending"
    },
    { 
      id: "2", 
      title: "Enviar relatório semanal", 
      time: "14:30", 
      category: "work",
      priority: "medium", 
      status: "pending"
    },
    { 
      id: "3", 
      title: "Treino de pernas", 
      time: "18:00", 
      category: "fitness",
      priority: "medium", 
      status: "pending"
    },
  ];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "work": return "Trabalho";
      case "study": return "Estudos";
      case "fitness": return "Fitness";
      case "personal": return "Pessoal";
      default: return category;
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "work": return "category-work";
      case "study": return "category-study";
      case "fitness": return "category-fitness";
      case "personal": return "category-personal";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Tarefas de Hoje</CardTitle>
        <CardDescription>
          Você tem {todayTasks.length} tarefas pendentes hoje
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayTasks.map((task) => (
            <div 
              key={task.id} 
              className={`task-card flex justify-between items-center priority-${task.priority}`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">{task.time}</span>
                    <Badge variant="outline" className={getCategoryClass(task.category)}>
                      {getCategoryLabel(task.category)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <CheckCircle className="h-5 w-5" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/tasks')}
          >
            Ver Todas as Tarefas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
