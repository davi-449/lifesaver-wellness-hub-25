
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Mail, UserRound, Lock, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado geral
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Campos de cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Campos de perfil - fitness
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [weightGoal, setWeightGoal] = useState<number>(70);
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  
  // Campos de perfil - trabalho
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [workStartTime, setWorkStartTime] = useState<string>("09:00");
  const [workEndTime, setWorkEndTime] = useState<string>("18:00");
  
  // Campos de perfil - estudo
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [studyStartTime, setStudyStartTime] = useState<string>("19:00");
  const [studyEndTime, setStudyEndTime] = useState<string>("22:00");
  const [studyCourse, setStudyCourse] = useState<string>("");

  const weekdays = [
    { label: "Segunda", value: "monday" },
    { label: "Terça", value: "tuesday" },
    { label: "Quarta", value: "wednesday" },
    { label: "Quinta", value: "thursday" },
    { label: "Sexta", value: "friday" },
    { label: "Sábado", value: "saturday" },
    { label: "Domingo", value: "sunday" }
  ];

  // Função para alternar dias da semana
  const toggleDay = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, day: string) => {
    if (array.includes(day)) {
      setArray(array.filter(d => d !== day));
    } else {
      setArray([...array, day]);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Criar conta
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName
          }
        }
      });
      
      if (error) throw error;
      
      // Configurar perfil com dados adicionais
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: displayName,
            height,
            weight_goal: weightGoal,
            fitness_level: fitnessLevel,
            work_days: workDays,
            work_start_time: workStartTime,
            work_end_time: workEndTime,
            study_days: isStudent ? studyDays : null,
            study_start_time: isStudent ? studyStartTime : null,
            study_end_time: isStudent ? studyEndTime : null,
            study_course: isStudent ? studyCourse : null
          })
          .eq('id', data.user.id);
        
        if (profileError) throw profileError;
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Bem-vindo ao WellnessHub!"
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para navegar entre os passos
  const goToStep = (newStep: number) => {
    // Validações
    if (newStep === 2 && step === 1) {
      if (!email || !password || !confirmPassword || password !== confirmPassword || !displayName) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos corretamente",
          variant: "destructive"
        });
        return;
      }
    }
    
    setStep(newStep);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">WellnessHub</h1>
          <p className="text-muted-foreground mt-2">Sua plataforma completa de bem-estar</p>
        </div>
        
        <Card className="border-muted-foreground/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Crie sua conta</CardTitle>
                <CardDescription>Passo {step} de 3</CardDescription>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={`w-3 h-3 rounded-full ${s === step ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={step === 3 ? handleSignUp : (e) => e.preventDefault()}>
            <CardContent>
              {/* Passo 1: Dados básicos */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name"
                        placeholder="Seu nome"
                        className="pl-10"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Passo 2: Dados fitness */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados Físicos</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="height">Altura</Label>
                          <span className="text-sm text-muted-foreground">{height} cm</span>
                        </div>
                        <Slider 
                          id="height"
                          value={[height]} 
                          min={140} 
                          max={220}
                          step={1}
                          onValueChange={(vals) => setHeight(vals[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="weightGoal">Meta de peso</Label>
                          <span className="text-sm text-muted-foreground">{weightGoal} kg</span>
                        </div>
                        <Slider 
                          id="weightGoal"
                          value={[weightGoal]} 
                          min={40} 
                          max={150}
                          step={1}
                          onValueChange={(vals) => setWeightGoal(vals[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fitnessLevel">Nível de condicionamento</Label>
                        <Select 
                          value={fitnessLevel} 
                          onValueChange={setFitnessLevel}
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
                  </div>
                </div>
              )}
              
              {/* Passo 3: Rotina */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Rotina de Trabalho</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Dias de trabalho</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {weekdays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`work-${day.value}`}
                                checked={workDays.includes(day.value)}
                                onCheckedChange={() => toggleDay(workDays, setWorkDays, day.value)}
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
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="workStartTime"
                              type="time"
                              className="pl-10"
                              value={workStartTime}
                              onChange={(e) => setWorkStartTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workEndTime">Hora de término</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="workEndTime"
                              type="time"
                              className="pl-10"
                              value={workEndTime}
                              onChange={(e) => setWorkEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox 
                        id="isStudent"
                        checked={isStudent}
                        onCheckedChange={(checked) => setIsStudent(checked === true)}
                      />
                      <Label htmlFor="isStudent" className="font-medium text-base">
                        Também estudo
                      </Label>
                    </div>
                    
                    {isStudent && (
                      <div className="space-y-4 pl-6 border-l-2 border-muted animate-fade-in">
                        <div className="space-y-2">
                          <Label htmlFor="studyCourse">Curso/Disciplina</Label>
                          <Input 
                            id="studyCourse"
                            placeholder="Ex: Administração, Inglês, etc."
                            value={studyCourse}
                            onChange={(e) => setStudyCourse(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Dias de estudo</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {weekdays.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`study-${day.value}`}
                                  checked={studyDays.includes(day.value)}
                                  onCheckedChange={() => toggleDay(studyDays, setStudyDays, day.value)}
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
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="studyStartTime"
                                type="time"
                                className="pl-10"
                                value={studyStartTime}
                                onChange={(e) => setStudyStartTime(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="studyEndTime">Hora de término</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="studyEndTime"
                                type="time"
                                className="pl-10"
                                value={studyEndTime}
                                onChange={(e) => setStudyEndTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => goToStep(step - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
              
              {step < 3 && (
                <Button 
                  type="button" 
                  onClick={() => goToStep(step + 1)}
                  className={step === 1 ? "ml-auto" : ""}
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {step === 3 && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Cadastro
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
          
          <div className="px-6 py-4 text-sm text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
