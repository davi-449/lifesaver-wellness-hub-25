
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Mock data for events
  const events = [
    {
      id: "1",
      title: "Reunião de equipe",
      date: new Date(2025, 4, 15, 10, 0),
      endDate: new Date(2025, 4, 15, 11, 0),
      category: "work",
      location: "Sala de Conferências"
    },
    {
      id: "2",
      title: "Enviar relatório semanal",
      date: new Date(2025, 4, 15, 14, 30),
      endDate: new Date(2025, 4, 15, 15, 0),
      category: "work"
    },
    {
      id: "3",
      title: "Treino de pernas",
      date: new Date(2025, 4, 15, 18, 0),
      endDate: new Date(2025, 4, 15, 19, 0),
      category: "fitness",
      location: "Academia"
    },
    {
      id: "4",
      title: "Aula de Matemática",
      date: new Date(2025, 4, 16, 8, 0),
      endDate: new Date(2025, 4, 16, 10, 0),
      category: "study",
      location: "Sala 305"
    },
    {
      id: "5",
      title: "Consulta Médica",
      date: new Date(2025, 4, 17, 15, 0),
      endDate: new Date(2025, 4, 17, 16, 0),
      category: "personal",
      location: "Clínica Central"
    }
  ];
  
  // Filter events by selected date
  const selectedDateEvents = events.filter(event => 
    date && 
    event.date.getDate() === date.getDate() && 
    event.date.getMonth() === date.getMonth() && 
    event.date.getFullYear() === date.getFullYear()
  );
  
  // Sort events by time
  selectedDateEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Format time as HH:MM
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get days with events for highlighting in calendar
  const daysWithEvents = events.map(event => 
    new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
  );
  
  // Function to get the category class for styling
  const getCategoryClass = (category: string) => {
    switch (category) {
      case "work": return "bg-blue-100 text-blue-800";
      case "study": return "bg-purple-100 text-purple-800";
      case "fitness": return "bg-green-100 text-green-800";
      case "personal": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Function to get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "work": return "Trabalho";
      case "study": return "Estudos";
      case "fitness": return "Fitness";
      case "personal": return "Pessoal";
      default: return category;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie seus eventos e compromissos
            </p>
          </div>
          <Button className="sm:self-end">
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Selecione uma data para ver os eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md p-4"
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
            <CardHeader>
              <CardTitle>
                {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Selecione uma data"}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length} eventos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex space-x-4 p-3 rounded-lg border">
                      <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        <div className={`rounded-full p-2 ${getCategoryClass(event.category)}`}>
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="mt-1 text-xs text-center">
                          {formatTime(event.date)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getCategoryClass(event.category)}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                          {event.location && (
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">Nenhum evento para esta data</p>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Evento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Visão geral dos seus próximos compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events
                .filter(event => event.date > new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 6)
                .map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge className={getCategoryClass(event.category)}>
                        {getCategoryLabel(event.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{event.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatTime(event.date)} - {formatTime(event.endDate)}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-xs mt-2">{event.location}</p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
