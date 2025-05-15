
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Task, Category, Priority, TaskStatus } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

export function TaskModal({ open, onOpenChange, task, mode, onSuccess }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<string>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useEffect(() => {
    // Carregar categorias do usuário
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) throw error;
        if (data) setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar suas categorias.",
          variant: "destructive"
        });
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  // Preencher o formulário quando estiver em modo de edição
  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.dueDate);
      setCategory(task.category || "work");
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      // Valores padrão para nova tarefa
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setCategory("work");
      setPriority("medium");
      setStatus("pending");
    }
  }, [task, mode, open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const categoryObj = categories.find(c => c.name === category);
      
      if (mode === 'create') {
        // Criar nova tarefa
        const { error } = await supabase
          .from('tasks')
          .insert({
            title,
            description: description || null,
            due_date: dueDate?.toISOString() || null,
            category_id: categoryObj?.id || null,
            priority,
            status
          });

        if (error) throw error;

        toast({
          title: "Tarefa criada",
          description: "Sua tarefa foi criada com sucesso!"
        });
      } else if (task?.id) {
        // Atualizar tarefa existente
        const { error } = await supabase
          .from('tasks')
          .update({
            title,
            description: description || null,
            due_date: dueDate?.toISOString() || null,
            category_id: categoryObj?.id || null,
            priority,
            status
          })
          .eq('id', task.id);

        if (error) throw error;

        toast({
          title: "Tarefa atualizada",
          description: "Sua tarefa foi atualizada com sucesso!"
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro ao salvar tarefa",
        description: "Não foi possível salvar sua tarefa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso!"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir sua tarefa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Nova tarefa' : 'Editar tarefa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                Título
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da tarefa"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1">
                Descrição
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dueDate" className="text-sm font-medium block mb-1">
                  Data de vencimento
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecionar data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label htmlFor="category" className="text-sm font-medium block mb-1">
                  Categoria
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name === "work" ? "Trabalho" : 
                           cat.name === "study" ? "Estudos" : 
                           cat.name === "fitness" ? "Fitness" : 
                           cat.name === "personal" ? "Pessoal" : cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="priority" className="text-sm font-medium block mb-1">
                  Prioridade
                </label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="status" className="text-sm font-medium block mb-1">
                  Status
                </label>
                <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className={cn("flex items-center", mode === 'edit' && "justify-between")}>
            {mode === 'edit' && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => setDeleteAlertOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : mode === 'create' ? "Criar" : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
