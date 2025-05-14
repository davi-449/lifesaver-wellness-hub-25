
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Bell, Shield, LogOut } from "lucide-react";
import { UserProfile } from "@/types";

const ProfilePage = () => {
  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: "João Silva",
    height: 178,
    weightGoal: 75,
    bodyFatGoal: 15,
    fitnessLevel: "intermediate",
    fitnessGoals: ["Perder peso", "Ganhar massa muscular"],
    waterIntakeGoal: 2500,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
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
                      <AvatarImage src="" alt={userProfile.displayName} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {userProfile.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Alterar Foto
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" value={userProfile.displayName} onChange={() => {}} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value="joao.silva@exemplo.com" onChange={() => {}} />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      value={userProfile.height} 
                      onChange={() => {}} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fitnessLevel">Nível de Condicionamento</Label>
                    <Select 
                      value={userProfile.fitnessLevel} 
                      onValueChange={(value) => 
                        setUserProfile({...userProfile, fitnessLevel: value as any})
                      }
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
                </div>
                
                <Button className="w-full md:w-auto">Salvar Alterações</Button>
              </CardContent>
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
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Objetivos Principais</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="goal1" checked={userProfile.fitnessGoals.includes("Perder peso")} />
                      <Label htmlFor="goal1">Perder peso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="goal2" checked={userProfile.fitnessGoals.includes("Ganhar massa muscular")} />
                      <Label htmlFor="goal2">Ganhar massa muscular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="goal3" checked={userProfile.fitnessGoals.includes("Melhorar resistência")} />
                      <Label htmlFor="goal3">Melhorar resistência</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="goal4" checked={userProfile.fitnessGoals.includes("Melhorar flexibilidade")} />
                      <Label htmlFor="goal4">Melhorar flexibilidade</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="weightGoal">Meta de Peso (kg)</Label>
                    <Input 
                      id="weightGoal" 
                      type="number" 
                      value={userProfile.weightGoal} 
                      onChange={() => {}} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bodyFatGoal">Meta de % de Gordura</Label>
                    <Input 
                      id="bodyFatGoal" 
                      type="number" 
                      value={userProfile.bodyFatGoal} 
                      onChange={() => {}} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="waterGoal">Meta Diária de Água (ml)</Label>
                    <Input 
                      id="waterGoal" 
                      type="number" 
                      value={userProfile.waterIntakeGoal} 
                      onChange={() => {}} 
                    />
                  </div>
                </div>
                
                <Button className="w-full md:w-auto">Salvar Objetivos</Button>
              </CardContent>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="googleCalendar">Google Agenda</Label>
                        <p className="text-sm text-muted-foreground">Sincronizar eventos com Google Agenda</p>
                      </div>
                      <Button variant="outline" size="sm">Conectar</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="googleFit">Google Fit</Label>
                        <p className="text-sm text-muted-foreground">Sincronizar dados com Google Fit (Mi Band)</p>
                      </div>
                      <Button variant="outline" size="sm">Conectar</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacidade e Segurança
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
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
