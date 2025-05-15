
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from "date-fns";

interface Measurement {
  id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export function MeasurementsHistory() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error("Erro ao buscar medidas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format the data for the charts
  const formatChartData = (data: Measurement[], key: keyof Measurement) => {
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: format(parseISO(item.date), 'dd/MM'),
        [key]: item[key]
      }))
      .filter(item => item[key] !== null);
  };

  // Only show charts for metrics that have at least 2 data points
  const hasEnoughData = (key: keyof Measurement) => {
    return measurements.filter(m => m[key] !== null).length >= 2;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          Histórico de Medidas
        </CardTitle>
        <CardDescription>
          Acompanhe a evolução das suas medidas corporais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            Carregando...
          </div>
        ) : measurements.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Nenhuma medida registrada ainda
          </div>
        ) : (
          <Tabs defaultValue="weight">
            <TabsList className="mb-4">
              {hasEnoughData('weight') && <TabsTrigger value="weight">Peso</TabsTrigger>}
              {hasEnoughData('body_fat') && <TabsTrigger value="body_fat">% Gordura</TabsTrigger>}
              {hasEnoughData('waist') && <TabsTrigger value="waist">Cintura</TabsTrigger>}
              {hasEnoughData('arms') && <TabsTrigger value="arms">Braços</TabsTrigger>}
            </TabsList>
            
            {hasEnoughData('weight') && (
              <TabsContent value="weight">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData(measurements, 'weight')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        name="Peso (kg)" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
            
            {hasEnoughData('body_fat') && (
              <TabsContent value="body_fat">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData(measurements, 'body_fat')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="body_fat" 
                        name="Gordura (%)" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
            
            {hasEnoughData('waist') && (
              <TabsContent value="waist">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData(measurements, 'waist')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="waist" 
                        name="Cintura (cm)" 
                        stroke="#ffc658" 
                        fill="#ffc658" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
            
            {hasEnoughData('arms') && (
              <TabsContent value="arms">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData(measurements, 'arms')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="arms" 
                        name="Braços (cm)" 
                        stroke="#ff8042" 
                        fill="#ff8042" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
