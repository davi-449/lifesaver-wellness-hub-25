
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, Category, Priority, TaskStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export const TaskModal = ({ open, onOpenChange, task, mode, onSuccess }: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Carregar categorias disponíveis
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          // Convertendo para o formato Category
          const formattedCategories = data.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
            user_id: cat.user_id
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    if (open) {
      fetchCategories();
    }
  }, [open]);
  
  // Preencher os dados da tarefa se estivermos editando
  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.dueDate);
      setCategoryId(task.category_id || "");
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      // Resetar formulário para criar uma nova tarefa
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setCategoryId("");
      setPriority("medium");
      setStatus("pending");
    }
  }, [task, mode, open]);
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Formatando a data (apenas se existir)
      const formattedDate = dueDate ? dueDate.toISOString() : null;
      
      if (mode === 'create') {
        // Buscar o ID do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        
        // Criar nova tarefa
        const { error } = await supabase
          .from('tasks')
          .insert({
            title,
            description,
            due_date: formattedDate,
            category_id: categoryId || null,
            priority,
            status,
            user_id: user.id
          });
          
        if (error) throw error;
        
        toast({
          title: "Tarefa criada",
          description: "Sua tarefa foi criada com sucesso."
        });
      } else if (mode === 'edit' && task) {
        // Editar tarefa existente
        const { error } = await supabase
          .from('tasks')
          .update({
            title,
            description,
            due_date: formattedDate,
            category_id: categoryId || null,
            priority,
            status
          })
          .eq('id', task.id);
          
        if (error) throw error;
        
        toast({
          title: "Tarefa atualizada",
          description: "Sua tarefa foi atualizada com sucesso."
        });
      }
      
      // Fechar modal e notificar sucesso
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
        
      if (error) throw error;
      
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso."
      });
      
      // Fechar modal e notificar sucesso
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao excluir a tarefa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{mode === 'create' ? 'Criar Nova Tarefa' : 'Editar Tarefa'}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descrição da tarefa"
              className="resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due-date">Data de vencimento</Label>
              <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP", { locale: ptBR })
                    ) : (
                      <span className="text-muted-foreground">Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setOpenDatePicker(false);
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }}></span>
                      <span>{category.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="px-6 pb-6 pt-2">
          {mode === 'edit' && (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading}
              className="mr-auto"
            >
              Excluir
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              mode === 'create' ? 'Criar' : 'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
