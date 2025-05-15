
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Calendar as CalendarIcon, MapPin, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_all_day?: boolean;
  color?: string;
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  
  // Buscar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) {
        toast({
          title: "Erro ao carregar eventos",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setEvents(data || []);
      }
      
      setLoading(false);
    };
    
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
      
      // Chamar a edge function para autenticação Google
      const { data, error } = await supabase.functions.invoke('google-integration', {
        body: { action: 'auth', calendar: true }
      });
      
      if (error) throw error;
      
      // Abrir janela para autenticação
      window.open(data.authUrl, '_blank', 'width=600,height=700');
      
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar ao Google Calendar",
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
            <Button variant="outline" onClick={syncWithGoogle}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Sincronizar Google
            </Button>
            <Drawer>
              <DrawerTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Evento
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh] overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle>Criar novo evento</DrawerTitle>
                  <DrawerDescription>
                    Adicione um novo evento à sua agenda
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  {/* Formulário para adicionar evento seria implementado aqui */}
                  <p className="text-center text-muted-foreground py-4">
                    Funcionalidade em desenvolvimento
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
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
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Evento
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          {/* Conteúdo do drawer para adicionar evento */}
                        </DrawerContent>
                      </Drawer>
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
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
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
    </AppLayout>
  );
};

export default CalendarPage;
