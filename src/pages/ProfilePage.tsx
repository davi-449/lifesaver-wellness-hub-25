import React, { useState, useEffect } from "react";
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
import { User, Settings, Bell, Shield, LogOut, Calendar, Activity, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  // Referência para o input de arquivo oculto
  const fileInputRef = React.createRef<HTMLInputElement>();
  
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
        
        // Check if user has avatar
        const { data: avatarData } = await supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}`);
          
        if (avatarData) {
          setAvatarUrl(`${avatarData.publicUrl}?t=${new Date().getTime()}`);
        }
        
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
      console.log("Saving profile with:", profile);
      
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
  
  // Upload de avatar
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você precisa selecionar uma imagem.");
      }
      
      const file = event.target.files[0];
      const filePath = `${user.id}`;
      
      setUploadingAvatar(true);
      
      // Verificar se o bucket existe, se não, criá-lo
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        const { error } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        if (error) throw error;
      }
      
      // Fazer upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (uploadError) throw uploadError;
      
      // Obter URL pública
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setAvatarUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar avatar",
        description: error.message || "Falha ao fazer upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
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
                    <Avatar className="h-24 w-24 border cursor-pointer hover:opacity-80 transition-opacity relative group" onClick={() => fileInputRef.current?.click()}>
                      <AvatarImage src={avatarUrl || ""} alt={profile.displayName} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {profile.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <Image className="h-8 w-8 text-white" />
                      </div>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={uploadAvatar}
                      style={{ display: 'none' }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Carregando..." : "Alterar Foto"}
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
                      <Switch id="notif1" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif2">Lembretes de Hidratação</Label>
                      <Switch id="notif2" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif3">Lembretes de Treinos</Label>
                      <Switch id="notif3" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif4">Notificações de Calendário</Label>
                      <Switch id="notif4" defaultChecked />
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setPrivacyDialogOpen(true)}
                  >
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
        
        {/* Dialog de privacidade e segurança */}
        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Política de Privacidade e Segurança</DialogTitle>
              <DialogDescription>
                Última atualização: 15 de maio de 2025
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Introdução</h3>
                <p>
                  Bem-vindo ao WellnessHub. Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. 
                  Esta política de privacidade explica como coletamos, usamos, processamos e compartilhamos suas informações.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Informações que coletamos</h3>
                <p className="mb-2">Podemos coletar os seguintes tipos de informação:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Informações pessoais básicas (nome, e-mail)</li>
                  <li>Dados de saúde e fitness (peso, altura, metas)</li>
                  <li>Agendas e horários (rotina de trabalho e estudos)</li>
                  <li>Dados de tarefas e compromissos</li>
                  <li>Informações de integração com serviços como Google Calendar e Google Fit</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Como usamos suas informações</h3>
                <p className="mb-2">Usamos suas informações para:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Fornecer, personalizar e melhorar nossos serviços</li>
                  <li>Processar e gerenciar suas tarefas, eventos e metas</li>
                  <li>Sincronizar dados com serviços terceiros que você autorizou</li>
                  <li>Enviar notificações relacionadas aos serviços</li>
                  <li>Garantir a segurança da sua conta</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">4. Segurança de dados</h3>
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais.
                  Todos os dados são armazenados com criptografia e seguem as melhores práticas do setor. O acesso aos seus dados é
                  estritamente controlado e limitado apenas ao necessário para fornecer os serviços.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">5. Compartilhamento de informações</h3>
                <p>
                  Não vendemos suas informações pessoais. Compartilhamos suas informações apenas nas seguintes circunstâncias:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Com provedores de serviços terceirizados que nos ajudam a oferecer nossos serviços</li>
                  <li>Com serviços de integração que você autorizar explicitamente (como Google)</li>
                  <li>Quando necessário por lei, processo legal ou para proteger seus interesses vitais</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">6. Seus direitos</h3>
                <p className="mb-2">Você tem diversos direitos relacionados aos seus dados pessoais:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Direito de acesso aos seus dados</li>
                  <li>Direito à retificação de dados incompletos ou imprecisos</li>
                  <li>Direito ao esquecimento (apagar seus dados)</li>
                  <li>Direito à portabilidade dos dados</li>
                  <li>Direito de objeção ao processamento dos seus dados</li>
                  <li>Direito de revogar o consentimento a qualquer momento</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">7. Retenção de dados</h3>
                <p>
                  Mantemos suas informações pessoais apenas pelo tempo necessário para os propósitos estabelecidos nesta Política
                  de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">8. Alterações nesta política</h3>
                <p>
                  Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações
                  publicando a nova Política de Privacidade nesta página e atualizando a data "última atualização" no topo.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">9. Entre em contato</h3>
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de proteção de dados, entre em contato
                  conosco em: privacy@wellnesshub.com
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setPrivacyDialogOpen(false)}>
                Entendi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
