
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Calendar as CalendarIcon, MapPin, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_all_day?: boolean;
  color?: string;
  google_event_id?: string;
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingEvents, setSyncingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(new Date().setHours(new Date().getHours() + 1)),
    location: "",
    isAllDay: false
  });
  const { toast } = useToast();
  
  // Buscar eventos
  const fetchEvents = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, [toast]);
  
  // Filtrar eventos por data selecionada
  const selectedDateEvents = events.filter(event => 
    date && 
    new Date(event.start_date).toDateString() === date.toDateString()
  );
  
  // Ordenar eventos por hora
  selectedDateEvents.sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  // Formatar tempo como HH:MM
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Obter dias com eventos para destacar no calendário
  const daysWithEvents = events.map(event => 
    new Date(event.start_date)
  );
  
  // Obter a cor baseada no evento ou usar uma cor padrão
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    
    // Cores padrão baseadas na primeira letra do título
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800", 
      "bg-green-100 text-green-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800"
    ];
    
    const index = event.title.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  // Formatar data completa
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  // Sincronizar com Google Calendar
  const syncWithGoogle = async () => {
    try {
      setSyncingEvents(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para sincronizar eventos",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Sincronizando",
        description: "Conectando ao Google Calendar..."
      });
      
      // Verificar se o usuário já tem integração
      const { data: integrationData } = await supabase
        .from('user_integrations')
        .select('google_calendar_sync, google_refresh_token')
        .eq('user_id', session.user.id)
        .single();
      
      if (integrationData?.google_refresh_token) {
        // Já tem integração, vamos apenas sincronizar
        const { data, error } = await supabase.functions.invoke('google-integration', {
          body: { action: 'sync-calendar' }
        });
        
        if (error) throw error;
        
        toast({
          title: "Sincronização concluída",
          description: `${data.eventsCount} eventos sincronizados com sucesso!`
        });
        
        fetchEvents(); // Recarregar eventos
      } else {
        // Precisa fazer a autorização
        const { data, error } = await supabase.functions.invoke('google-integration', {
          body: { action: 'auth', calendar: true }
        });
        
        if (error) throw error;
        
        // Abrir janela para autenticação
        window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        toast({
          title: "Autorização necessária",
          description: "Por favor, autorize o acesso ao Google Calendar na janela que foi aberta."
        });
      }
    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar ao Google Calendar",
        variant: "destructive"
      });
    } finally {
      setSyncingEvents(false);
    }
  };
  
  // Adicionar novo evento
  const handleAddEvent = async () => {
    try {
      if (!newEvent.title) {
        toast({
          title: "Erro",
          description: "O título do evento é obrigatório",
          variant: "destructive"
        });
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para adicionar eventos",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.from('calendar_events').insert({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        start_date: newEvent.startDate.toISOString(),
        end_date: newEvent.endDate.toISOString(),
        location: newEvent.location,
        is_all_day: newEvent.isAllDay
      });
      
      if (error) throw error;
      
      toast({
        title: "Evento adicionado",
        description: "O evento foi adicionado ao seu calendário com sucesso!"
      });
      
      setIsAddEventOpen(false);
      setNewEvent({
        title: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        location: "",
        isAllDay: false
      });
      
      fetchEvents(); // Recarregar eventos
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar evento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Excluir evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id);
        
      if (error) throw error;
      
      toast({
        title: "Evento excluído",
        description: "O evento foi removido do seu calendário"
      });
      
      setSelectedEvent(null);
      fetchEvents(); // Recarregar eventos
    } catch (error: any) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie seus eventos e compromissos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={syncWithGoogle}
              disabled={syncingEvents}
            >
              {syncingEvents ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Sincronizar Google
                </>
              )}
            </Button>
            <Button onClick={() => setIsAddEventOpen(true)}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="day" className="space-y-6">
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
          
          <TabsContent value="day" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:row-span-2">
                <CardHeader>
                  <CardTitle>Calendário</CardTitle>
                  <CardDescription>
                    Selecione uma data para ver os eventos
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="border rounded-md p-3 mx-auto max-w-full"
                    modifiers={{
                      hasEvent: daysWithEvents,
                    }}
                    modifiersStyles={{
                      hasEvent: { 
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'hsl(var(--primary))',
                        textDecorationThickness: '2px',
                      }
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    {date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length} eventos programados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-pulse w-full max-w-md">
                        <div className="h-14 bg-muted rounded-md mb-3"></div>
                        <div className="h-14 bg-muted rounded-md mb-3"></div>
                        <div className="h-14 bg-muted rounded-md"></div>
                      </div>
                    </div>
                  ) : selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <button
                          key={event.id}
                          className="flex w-full space-x-4 p-3 rounded-lg border hover:shadow-md transition-shadow hover:bg-accent/20"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex-shrink-0 flex flex-col items-center justify-center">
                            <div className={`rounded-full p-2 ${getEventColor(event)}`}>
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="mt-1 text-xs text-center">
                              {formatTime(event.start_date)}
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">{event.title}</h4>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">Nenhum evento para esta data</p>
                      <Button variant="outline" size="sm" onClick={() => setIsAddEventOpen(true)}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Adicionar Evento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {selectedEvent && (
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle>{selectedEvent.title}</CardTitle>
                      <CardDescription>
                        {formatDate(selectedEvent.start_date)}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(selectedEvent.start_date)} - {formatTime(selectedEvent.end_date)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedEvent.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                      
                      {selectedEvent.description && (
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-1">Descrição</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1" 
                        onClick={() => {
                          setNewEvent({
                            title: selectedEvent.title,
                            description: selectedEvent.description || "",
                            startDate: new Date(selectedEvent.start_date),
                            endDate: new Date(selectedEvent.end_date),
                            location: selectedEvent.location || "",
                            isAllDay: !!selectedEvent.is_all_day
                          });
                          setSelectedEvent(null);
                          setIsAddEventOpen(true);
                        }}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={handleDeleteEvent}>
                        Excluir
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="month">
            <Card>
              <CardHeader>
                <CardTitle>Visão mensal</CardTitle>
                <CardDescription>
                  Todos os eventos do mês atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 bg-muted rounded-md"></div>
                    ))}
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-6">
                    {/* Agrupar eventos por data */}
                    {Array.from(
                      events.reduce((groups, event) => {
                        const date = new Date(event.start_date).toDateString();
                        if (!groups.has(date)) groups.set(date, []);
                        groups.get(date)?.push(event);
                        return groups;
                      }, new Map<string, CalendarEvent[]>())
                    ).map(([dateString, dateEvents]) => (
                      <div key={dateString} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg mb-2">
                          {format(new Date(dateString), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <div className="grid gap-2">
                          {dateEvents.map(event => (
                            <button
                              key={event.id}
                              className="flex items-center p-2 rounded-md hover:bg-accent/20 w-full text-left"
                              onClick={() => {
                                setDate(new Date(event.start_date));
                                setSelectedEvent(event);
                              }}
                            >
                              <div className={`w-1 self-stretch rounded-full mr-3 ${getEventColor(event)}`}></div>
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum evento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal para adicionar evento */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Evento</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para adicionar um evento ao seu calendário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                placeholder="Nome do evento" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea 
                id="description" 
                placeholder="Detalhes do evento" 
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="all-day"
                checked={newEvent.isAllDay}
                onCheckedChange={(checked) => setNewEvent({...newEvent, isAllDay: checked})}
              />
              <Label htmlFor="all-day">Evento de dia inteiro</Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data de início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newEvent.startDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.startDate}
                      onSelect={(date) => date && setNewEvent({
                        ...newEvent, 
                        startDate: date,
                        // Se a data final é antes da nova data inicial, ajuste-a
                        endDate: date > newEvent.endDate ? date : newEvent.endDate
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {!newEvent.isAllDay && (
                  <Input 
                    type="time"
                    value={format(newEvent.startDate, "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(newEvent.startDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setNewEvent({...newEvent, startDate: newDate});
                    }}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Data de término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newEvent.endDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.endDate}
                      onSelect={(date) => date && setNewEvent({
                        ...newEvent, 
                        endDate: date,
                        // Se a nova data final é antes da data inicial, ajuste-a
                        startDate: date < newEvent.startDate ? date : newEvent.startDate
                      })}
                      initialFocus
                      disabled={(date) => date < newEvent.startDate}
                    />
                  </PopoverContent>
                </Popover>
                
                {!newEvent.isAllDay && (
                  <Input 
                    type="time"
                    value={format(newEvent.endDate, "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(newEvent.endDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setNewEvent({...newEvent, endDate: newDate});
                    }}
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização (opcional)</Label>
              <Input 
                id="location" 
                placeholder="Local do evento" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEvent}>
              Salvar Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CalendarPage;
