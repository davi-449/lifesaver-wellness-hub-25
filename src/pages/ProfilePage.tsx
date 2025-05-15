
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Bell, Shield, LogOut, Calendar, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Profile state
  const [profile, setProfile] = useState({
    displayName: "",
    height: 170,
    weight: 70,
    weightGoal: 70,
    bodyFatGoal: 15,
    fitnessLevel: "beginner",
    waterIntakeGoal: 2000,
    workDays: [] as string[],
    workStartTime: "",
    workEndTime: "",
    studyDays: [] as string[],
    studyStartTime: "",
    studyEndTime: "",
    studyCourse: ""
  });
  
  // Integration state
  const [integrations, setIntegrations] = useState({
    googleCalendarSync: false,
    googleFitnessSync: false,
    lastSyncTime: null as string | null
  });
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        setUser(user);
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Get integration data
        const { data: integrationData } = await supabase
          .from('user_integrations')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // Update state with loaded data
        setProfile({
          displayName: profileData.display_name || "",
          height: profileData.height || 170,
          weight: 70, // Default as it's not in the database
          weightGoal: profileData.weight_goal || 70,
          bodyFatGoal: profileData.body_fat_goal || 15,
          fitnessLevel: profileData.fitness_level || "beginner",
          waterIntakeGoal: profileData.water_intake_goal || 2000,
          workDays: profileData.work_days || [],
          workStartTime: profileData.work_start_time || "",
          workEndTime: profileData.work_end_time || "",
          studyDays: profileData.study_days || [],
          studyStartTime: profileData.study_start_time || "",
          studyEndTime: profileData.study_end_time || "",
          studyCourse: profileData.study_course || ""
        });
        
        if (integrationData) {
          setIntegrations({
            googleCalendarSync: integrationData.google_calendar_sync || false,
            googleFitnessSync: integrationData.google_fitness_sync || false,
            lastSyncTime: integrationData.last_sync_timestamp
          });
        }
        
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: error.message || "Não foi possível carregar os dados do usuário",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [toast]);
  
  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
          height: profile.height,
          weight_goal: profile.weightGoal,
          body_fat_goal: profile.bodyFatGoal,
          fitness_level: profile.fitnessLevel,
          water_intake_goal: profile.waterIntakeGoal,
          work_days: profile.workDays,
          work_start_time: profile.workStartTime,
          work_end_time: profile.workEndTime,
          study_days: profile.studyDays,
          study_start_time: profile.studyStartTime,
          study_end_time: profile.studyEndTime,
          study_course: profile.studyCourse
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso"
      });
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  // Iniciar processo de integração com Google
  const startGoogleIntegration = async (type: 'calendar' | 'fitness' | 'both') => {
    try {
      const params = {
        calendar: type === 'calendar' || type === 'both',
        fitness: type === 'fitness' || type === 'both'
      };
      
      const { data, error } = await supabase.functions.invoke('google-integration', {
        body: { 
          action: 'auth',
          ...params
        }
      });
      
      if (error) throw error;
      
      // Abrir janela para autenticação
      window.open(data.authUrl, '_blank', 'width=600,height=700');
      
    } catch (error: any) {
      toast({
        title: "Erro na integração",
        description: error.message || "Não foi possível conectar ao Google",
        variant: "destructive"
      });
    }
  };
  
  const weekdays = [
    { label: "Segunda", value: "monday" },
    { label: "Terça", value: "tuesday" },
    { label: "Quarta", value: "wednesday" },
    { label: "Quinta", value: "thursday" },
    { label: "Sexta", value: "friday" },
    { label: "Sábado", value: "saturday" },
    { label: "Domingo", value: "sunday" }
  ];
  
  const toggleWorkDay = (day: string) => {
    setProfile(prev => {
      if (prev.workDays.includes(day)) {
        return { ...prev, workDays: prev.workDays.filter(d => d !== day) };
      } else {
        return { ...prev, workDays: [...prev.workDays, day] };
      }
    });
  };
  
  const toggleStudyDay = (day: string) => {
    setProfile(prev => {
      if (prev.studyDays.includes(day)) {
        return { ...prev, studyDays: prev.studyDays.filter(d => d !== day) };
      } else {
        return { ...prev, studyDays: [...prev.studyDays, day] };
      }
    });
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e informações pessoais
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <TabsList className="grid max-w-md grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" alt={profile.displayName} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {profile.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Alterar Foto
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name" 
                        value={profile.displayName} 
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email} 
                        disabled 
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informações de Trabalho</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Dias de trabalho</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {weekdays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`work-${day.value}`}
                                checked={profile.workDays.includes(day.value)}
                                onCheckedChange={() => toggleWorkDay(day.value)}
                              />
                              <Label htmlFor={`work-${day.value}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="workStartTime">Hora de início</Label>
                          <Input 
                            id="workStartTime" 
                            type="time" 
                            value={profile.workStartTime} 
                            onChange={(e) => setProfile({...profile, workStartTime: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workEndTime">Hora de término</Label>
                          <Input 
                            id="workEndTime" 
                            type="time" 
                            value={profile.workEndTime} 
                            onChange={(e) => setProfile({...profile, workEndTime: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informações de Estudo</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="studyCourse">Curso/Disciplina</Label>
                        <Input 
                          id="studyCourse" 
                          placeholder="Ex: Administração, Inglês, etc."
                          value={profile.studyCourse} 
                          onChange={(e) => setProfile({...profile, studyCourse: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Dias de estudo</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {weekdays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`study-${day.value}`}
                                checked={profile.studyDays.includes(day.value)}
                                onCheckedChange={() => toggleStudyDay(day.value)}
                              />
                              <Label htmlFor={`study-${day.value}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="studyStartTime">Hora de início</Label>
                          <Input 
                            id="studyStartTime" 
                            type="time" 
                            value={profile.studyStartTime} 
                            onChange={(e) => setProfile({...profile, studyStartTime: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studyEndTime">Hora de término</Label>
                          <Input 
                            id="studyEndTime" 
                            type="time" 
                            value={profile.studyEndTime} 
                            onChange={(e) => setProfile({...profile, studyEndTime: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="ml-auto"
                >
                  {saving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Fitness</CardTitle>
                <CardDescription>
                  Defina seus objetivos para personalizar sua experiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      value={profile.height} 
                      onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fitnessLevel">Nível de Condicionamento</Label>
                    <Select 
                      value={profile.fitnessLevel} 
                      onValueChange={(value) => setProfile({...profile, fitnessLevel: value as any})}
                    >
                      <SelectTrigger id="fitnessLevel">
                        <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weightGoal">Meta de Peso (kg)</Label>
                    <Input 
                      id="weightGoal" 
                      type="number" 
                      value={profile.weightGoal} 
                      onChange={(e) => setProfile({...profile, weightGoal: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bodyFatGoal">Meta de % de Gordura</Label>
                    <Input 
                      id="bodyFatGoal" 
                      type="number" 
                      value={profile.bodyFatGoal} 
                      onChange={(e) => setProfile({...profile, bodyFatGoal: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="waterGoal">Meta Diária de Água (ml)</Label>
                    <Input 
                      id="waterGoal" 
                      type="number" 
                      value={profile.waterIntakeGoal} 
                      onChange={(e) => setProfile({...profile, waterIntakeGoal: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="ml-auto"
                >
                  {saving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : "Salvar Objetivos"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Aplicativo</CardTitle>
                <CardDescription>
                  Personalize sua experiência no aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif1">Lembretes de Tarefas</Label>
                      <Switch id="notif1" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif2">Lembretes de Hidratação</Label>
                      <Switch id="notif2" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif3">Lembretes de Treinos</Label>
                      <Switch id="notif3" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif4">Notificações de Calendário</Label>
                      <Switch id="notif4" checked />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Integrações</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Label>Google Agenda</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Sincronizar eventos com Google Agenda</p>
                      </div>
                      <Button 
                        variant={integrations.googleCalendarSync ? "default" : "outline"} 
                        size="sm"
                        onClick={() => startGoogleIntegration('calendar')}
                      >
                        {integrations.googleCalendarSync ? "Sincronizar" : "Conectar"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <Label>Google Fit</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Sincronizar dados de fitness</p>
                      </div>
                      <Button 
                        variant={integrations.googleFitnessSync ? "default" : "outline"} 
                        size="sm"
                        onClick={() => startGoogleIntegration('fitness')}
                      >
                        {integrations.googleFitnessSync ? "Sincronizar" : "Conectar"}
                      </Button>
                    </div>
                    
                    {integrations.lastSyncTime && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Última sincronização: {new Date(integrations.lastSyncTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacidade e Segurança
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
