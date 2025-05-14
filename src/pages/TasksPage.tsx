
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Task, Priority, Category, TaskStatus } from "@/types";

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Mock data
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Reunião de equipe",
      description: "Discutir os próximos passos do projeto",
      dueDate: new Date(2025, 4, 15, 10, 0),
      category: "work",
      priority: "high",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Enviar relatório semanal",
      description: "Compilar dados e enviar para gerência",
      dueDate: new Date(2025, 4, 15, 14, 30),
      category: "work",
      priority: "medium",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "Treino de pernas",
      description: "Foco em agachamentos e leg press",
      dueDate: new Date(2025, 4, 15, 18, 0),
      category: "fitness",
      priority: "medium",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      title: "Leitura do capítulo 5",
      description: "Preparar para discussão na aula",
      dueDate: new Date(2025, 4, 16, 10, 0),
      category: "study",
      priority: "high",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "5",
      title: "Comprar presentes",
      description: "Aniversário da mãe no domingo",
      dueDate: new Date(2025, 4, 17, 12, 0),
      category: "personal",
      priority: "low",
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "6",
      title: "Atualizar currículo",
      description: "",
      dueDate: new Date(2025, 4, 20, 16, 0),
      category: "personal",
      priority: "medium",
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case "work": return "Trabalho";
      case "study": return "Estudos";
      case "fitness": return "Fitness";
      case "personal": return "Pessoal";
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "pending": return "Pendente";
      case "in-progress": return "Em Andamento";
      case "completed": return "Concluída";
    }
  };

  const filterTasks = (tasks: Task[], status: TaskStatus) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus = task.status === status;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  };

  const pendingTasks = filterTasks(mockTasks, "pending");
  const inProgressTasks = filterTasks(mockTasks, "in-progress");
  const completedTasks = filterTasks(mockTasks, "completed");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground">
              Gerencie suas tarefas e acompanhe seu progresso
            </p>
          </div>
          <Button className="sm:self-end">
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="work">Trabalho</SelectItem>
              <SelectItem value="study">Estudos</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="personal">Pessoal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas Prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pendentes ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Em Andamento ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card priority-${task.priority}`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className="text-sm">{formatDate(task.dueDate!)}</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`category-${task.category}`}>
                          {getCategoryLabel(task.category)}
                        </Badge>
                        <Badge variant="outline">
                          Prioridade: {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm">
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa pendente encontrada
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="in-progress" className="mt-6">
            <div className="space-y-4">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card priority-${task.priority}`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className="text-sm">{formatDate(task.dueDate!)}</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`category-${task.category}`}>
                          {getCategoryLabel(task.category)}
                        </Badge>
                        <Badge variant="outline">
                          Prioridade: {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm">
                          Concluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa em andamento encontrada
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card priority-${task.priority} opacity-75`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className="text-sm">{formatDate(task.dueDate!)}</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`category-${task.category}`}>
                          {getCategoryLabel(task.category)}
                        </Badge>
                        <Badge variant="outline">
                          Prioridade: {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Reativar
                        </Button>
                        <Button size="sm" variant="destructive">
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa concluída encontrada
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TasksPage;
