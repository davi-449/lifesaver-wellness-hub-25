
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Task, Category, Priority, TaskStatus } from "@/types";
import { TaskModal } from "@/components/tasks/TaskModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Carregar tarefas e categorias
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Carregar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        
        // Carregar tarefas
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            categories:category_id (*)
          `);
          
        if (tasksError) throw tasksError;
        
        // Converter os dados do Supabase para o formato esperado pelo componente
        const formattedTasks: Task[] = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          category: task.categories?.name || 'work',
          category_id: task.category_id,
          priority: task.priority as Priority,
          status: task.status as TaskStatus,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
        }));
        
        // Converter categorias para o formato esperado
        const formattedCategories: Category[] = categoriesData ? categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          user_id: cat.user_id,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        })) : [];
        
        setTasks(formattedTasks);
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar suas tarefas e categorias.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Configurar listener para atualizações em tempo real
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, () => {
        fetchData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (categoryName: string) => {
    switch (categoryName) {
      case "work": return "Trabalho";
      case "study": return "Estudos";
      case "fitness": return "Fitness";
      case "personal": return "Pessoal";
      default: return categoryName;
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

  const pendingTasks = filterTasks(tasks, "pending");
  const inProgressTasks = filterTasks(tasks, "in-progress");
  const completedTasks = filterTasks(tasks, "completed");

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleTaskStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: `Tarefa ${newStatus === 'completed' ? 'concluída' : 'atualizada'}`,
        description: `A tarefa "${task.title}" foi ${newStatus === 'completed' ? 'marcada como concluída' : 'atualizada'}.`
      });
      
      // Atualização local para feedback imediato
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar o status da tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const renderTaskCard = (task: Task, actions: React.ReactNode) => (
    <div
      key={task.id}
      className={`task-card priority-${task.priority}`}
    >
      <div className="flex justify-between">
        <h3 className="font-medium">{task.title}</h3>
        <span className="text-sm">{task.dueDate ? formatDate(task.dueDate) : "Sem data"}</span>
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
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditTask(task)}
          >
            Editar
          </Button>
          {actions}
        </div>
      </div>
    </div>
  );

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
          <Button className="sm:self-end" onClick={handleCreateTask}>
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
              {isLoading ? (
                <div className="text-center py-8">Carregando tarefas...</div>
              ) : pendingTasks.length > 0 ? (
                pendingTasks.map((task) => renderTaskCard(
                  task,
                  <Button 
                    size="sm"
                    onClick={() => handleTaskStatusChange(task, "in-progress")}
                  >
                    Iniciar
                  </Button>
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
              {isLoading ? (
                <div className="text-center py-8">Carregando tarefas...</div>
              ) : inProgressTasks.length > 0 ? (
                inProgressTasks.map((task) => renderTaskCard(
                  task,
                  <Button 
                    size="sm"
                    onClick={() => handleTaskStatusChange(task, "completed")}
                  >
                    Concluir
                  </Button>
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
              {isLoading ? (
                <div className="text-center py-8">Carregando tarefas...</div>
              ) : completedTasks.length > 0 ? (
                completedTasks.map((task) => renderTaskCard(
                  task,
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTaskStatusChange(task, "pending")}
                  >
                    Reativar
                  </Button>
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

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={selectedTask}
        mode={modalMode}
        onSuccess={() => {
          // Recarregar dados após criar/editar tarefa
          // Não é necessário fazer nada aqui pois o listener em tempo real cuidará disso
        }}
      />
    </AppLayout>
  );
};

export default TasksPage;
